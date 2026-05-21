import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '../api/endpoints';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

export const useAdminEvents = (institutionId) => {
    const { addToast } = useToast();
    const confirm = useConfirm();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = institutionId 
                ? await eventsApi.getByInstitution(institutionId)
                : await eventsApi.getAll();
                
            if (response.data.success) {
                setEvents(response.data.events);
            } else {
                setError('Failed to fetch events');
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [institutionId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const deleteEvent = async (eventId) => {
        const ok = await confirm({
            title: 'Delete event?',
            message: 'This will permanently delete the event. This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!ok) return false;

        try {
            const res = await eventsApi.delete(eventId);
            if (res.data.success) {
                setEvents(prev => prev.filter(e => e._id !== eventId));
                addToast({ type: 'success', title: 'Event deleted', message: 'The event has been removed.' });
                return true;
            }
        } catch (err) {
            console.error('Failed to delete event', err);
            addToast({ type: 'error', title: 'Delete failed', message: err.response?.data?.message || 'Could not delete the event.' });
        }
        return false;
    };

    const updateEventStatus = async (eventId, newStatus) => {
        try {
            const res = await eventsApi.updateStatus(eventId, newStatus);
            if (res.data.success) {
                setEvents(prev => prev.map(e =>
                    e._id === eventId ? { ...e, status: newStatus } : e
                ));
                return true;
            }
        } catch (err) {
            console.error('Failed to update status', err);
            addToast({ type: 'error', title: 'Update failed', message: err.response?.data?.message || err.message || 'Could not update event status.' });
        }
        return false;
    };

    return {
        events,
        loading,
        error,
        deleteEvent,
        updateEventStatus,
        refreshEvents: fetchEvents
    };
};

