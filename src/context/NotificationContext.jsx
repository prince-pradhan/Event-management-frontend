import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { notificationApi } from '../api/endpoints';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await notificationApi.getMe({ limit: 10 });
            if (res.data?.success) {
                setNotifications(res.data.notifications);
                // Backend returns "read" flag on each notification
                const unread = res.data.notifications.filter(n => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();

            // Initialize Socket
            const socketUrl = import.meta.env.VITE_API_URL || '';
            const socket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('[Socket] Connected to server');
                // If the server expects joining a personal room
                if (user?._id) {
                    socket.emit('join_room', user._id);
                }
            });

            socket.on('receive_notification', (payload) => {
                console.log('[Socket] New notification received:', payload);
                // Add to the list and increment unread count
                setNotifications(prev => [payload, ...prev].slice(0, 20));
                setUnreadCount(prev => prev + 1);

                // Show toast alert
                addToast({
                    title: payload.title,
                    message: payload.message,
                    type: 'notification'
                });
            });

            socket.on('disconnect', () => {
                console.log('[Socket] Disconnected');
            });

            return () => {
                if (socket) {
                    socket.disconnect();
                    socketRef.current = null;
                }
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
    }, [isAuthenticated, user?._id, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const res = await notificationApi.markRead(id);
            if (res.data?.success) {
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
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

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
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
