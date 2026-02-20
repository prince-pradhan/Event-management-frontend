import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '../../../api/endpoints';

export const useAdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await eventsApi.getAll();
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
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const deleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return false;
        }

        try {
            const res = await eventsApi.delete(eventId);
            if (res.data.success) {
                setEvents(prev => prev.filter(e => e._id !== eventId));
                return true;
            }
        } catch (err) {
            console.error('Failed to delete event', err);
            alert('Failed to delete event');
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
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
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
