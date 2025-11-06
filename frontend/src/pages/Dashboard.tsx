import React, { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import { Event, EventStatus } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventAPI.getMyEvents();
      setEvents(data);
    } catch (err: any) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await eventAPI.createEvent(newEvent);
      setShowModal(false);
      setNewEvent({ title: '', startTime: '', endTime: '' });
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
    try {
      await eventAPI.updateEvent(eventId, { status: newStatus });
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventAPI.deleteEvent(eventId);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete event');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Events</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Create New Event
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="empty-state">No events yet. Create your first event!</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className={`event-card status-${event.status.toLowerCase()}`}>
              <h3>{event.title}</h3>
              <p className="event-time">
                {formatDate(event.startTime)} - {formatDate(event.endTime)}
              </p>
              <div className="event-status">
                <span className={`status-badge ${event.status.toLowerCase()}`}>
                  {event.status.replace('_', ' ')}
                </span>
              </div>
              <div className="event-actions">
                {event.status === EventStatus.BUSY && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleStatusChange(event._id, EventStatus.SWAPPABLE)}
                  >
                    Make Swappable
                  </button>
                )}
                {event.status === EventStatus.SWAPPABLE && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleStatusChange(event._id, EventStatus.BUSY)}
                  >
                    Make Busy
                  </button>
                )}
                {event.status !== EventStatus.SWAP_PENDING && (
                  <button className="btn-danger" onClick={() => handleDeleteEvent(event._id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;