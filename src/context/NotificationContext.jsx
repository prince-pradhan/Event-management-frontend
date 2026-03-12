import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { notificationApi, institutionsApi } from '../api/endpoints';
import { USER_ROLE, INSTITUTION_STATUS } from '../utils/constants';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const auth = useAuth();
    const { user, isAuthenticated, isSystemAdmin } = auth;
    const addToast = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingInstitutions, setPendingInstitutions] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, hasMore: false });
    const socketRef = useRef(null);
    const readLocalRef = useRef(new Set());

    useEffect(() => {
        if (user?._id) {
            try {
                const raw = localStorage.getItem(`notif_read:${user._id}`);
                const ids = raw ? JSON.parse(raw) : [];
                readLocalRef.current = new Set(ids);
            } catch {
                readLocalRef.current = new Set();
            }
        } else {
            readLocalRef.current = new Set();
        }
    }, [user?._id]);

    const persistLocalRead = useCallback(() => {
        if (user?._id) {
            try {
                localStorage.setItem(
                    `notif_read:${user._id}`,
                    JSON.stringify(Array.from(readLocalRef.current))
                );
            } catch {}
        }
    }, [user?._id]);

    const computeReadFlag = useCallback((list) => {
        const localSet = readLocalRef.current;
        return list.map(n => ({
            ...n,
            read: n.read || localSet.has(n._id),
        }));
    }, []);

    const fetchNotifications = useCallback(
        async ({ page = 1, limit = 20, unreadOnly = false, append = false } = {}) => {
            if (!isAuthenticated) return;
            setLoading(true);
            try {
                const res = await notificationApi.getMe({ page, limit, unreadOnly });
                if (res.data?.success) {
                    const items = computeReadFlag(res.data.notifications || []);
                    if (append) {
                        setNotifications(prev => {
                            const merged = [...prev, ...items];
                            const dedup = new Map(merged.map(i => [i._id, i]));
                            return Array.from(dedup.values()).sort(
                                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                            );
                        });
                    } else {
                        setNotifications(items);
                    }
                    setUnreadCount(() => {
                        const all = append ? (prev => {
                            const merged = [...prev, ...items];
                            const dedup = new Map(merged.map(i => [i._id, i]));
                            return Array.from(dedup.values());
                        })([]) : items;
                        return all.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
                    });
                    const total = res.data.pagination?.total ?? items.length;
                    const hasMore = (page * limit) < total;
                    setPagination({ page, limit, total, hasMore });
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, computeReadFlag]
    );

    const fetchPendingInstitutions = useCallback(async () => {
        if (!isAuthenticated || !isSystemAdmin) return;
        try {
            const res = await institutionsApi.list(INSTITUTION_STATUS.PENDING_VERIFICATION);
            if (res.data?.success) {
                setPendingInstitutions(res.data.institutions?.length || 0);
            }
        } catch (error) {
            console.error('Failed to fetch pending institutions:', error);
        }
    }, [isAuthenticated, isSystemAdmin]);

    useEffect(() => {
        if (isAuthenticated && isSystemAdmin) {
            fetchPendingInstitutions();
        }
    }, [isAuthenticated, isSystemAdmin, fetchPendingInstitutions]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications({ page: 1, limit: 20, append: false });

            // Derive a proper Socket base URL (avoid pointing to "/api")
            const rawBase = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';
            let socketBase = rawBase || (typeof window !== 'undefined' ? window.location.origin : '');
            try {
                if (socketBase.endsWith('/api')) {
                    socketBase = socketBase.replace(/\/api\/?$/, '');
                }
            } catch {}
            const socket = io(socketBase, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('[Socket] Connected to server');
                if (user?._id) {
                    socket.emit('setup', user._id);
                }
            });

            socket.on('receive_notification', (payload) => {
                console.log('[Socket] New notification received:', payload);

                if (payload.data?.action === 'REFRESH_PROFILE') {
                    console.log('REFRESH_PROFILE action detected, refreshing user...');
                    if (auth.refreshUser) {
                        auth.refreshUser();
                    }
                }

                if (payload.data?.action === 'VERIFY_INSTITUTION') {
                    console.log('VERIFY_INSTITUTION action detected, incrementing pending institutions count...');
                    setPendingInstitutions(prev => prev + 1);
                }

                setNotifications(prev => {
                    const next = [payload, ...prev];
                    const dedup = new Map(next.map(i => [i._id, i]));
                    return Array.from(dedup.values()).sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );
                });
                const isLocallyRead = readLocalRef.current.has(payload._id);
                if (!isLocallyRead) {
                    setUnreadCount(prev => prev + 1);
                }

                addToast({
                    title: payload.title,
                    message: payload.message,
                    type: 'notification'
                });
            });

            socket.on('disconnect', () => {
                console.log('[Socket] Disconnected');
            });
            socket.on('connect_error', (err) => {
                console.warn('[Socket] Connect error:', err?.message || err);
            });

            return () => {
                if (socketRef.current) {
                    console.log('[Socket] Disconnecting due to component unmount or auth change.');
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        } else if (socketRef.current) {
            console.log('[Socket] Disconnecting due to unauthentication.');
            socketRef.current.disconnect();
            socketRef.current = null;
            // Clear state
            setNotifications([]);
            setUnreadCount(0);
            setPendingInstitutions(0);
            setPagination({ page: 1, limit: 20, total: 0, hasMore: false });
        }
    }, [isAuthenticated, user?._id]);

    const markAsRead = async (id) => {
        try {
            const res = await notificationApi.markRead(id);
            if (res.data?.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
                if (!readLocalRef.current.has(id)) {
                    readLocalRef.current.add(id);
                    persistLocalRead();
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const res = await notificationApi.delete(id);
            if (res.data?.success) {
                const wasUnread = notifications.find(n => n._id === id && !n.read);
                setNotifications(prev => prev.filter(n => n._id !== id));
                if (wasUnread) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const markAllAsRead = async () => {
        const toMark = notifications.filter(n => !n.read).map(n => n._id);
        if (toMark.length === 0) return;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        toMark.forEach(id => {
            if (!readLocalRef.current.has(id)) {
                readLocalRef.current.add(id);
            }
        });
        persistLocalRead();
        await Promise.allSettled(toMark.map(id => notificationApi.markRead(id)));
    };

    const loadMore = async ({ unreadOnly = false } = {}) => {
        const nextPage = pagination.page + 1;
        if (!pagination.hasMore) return;
        await fetchNotifications({ page: nextPage, limit: pagination.limit, unreadOnly, append: true });
        setUnreadCount(current => {
            const totalUnread = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
            return totalUnread;
        });
    };

    const value = {
        notifications,
        unreadCount,
        pendingInstitutions,
        loading,
        pagination,
        fetchNotifications,
        fetchPendingInstitutions,
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
}
