import React, { useState, useEffect } from 'react';
import { eventAPI, swapAPI } from '../services/api';
import { Event, EventStatus, User } from '../types';
import './Marketplace.css';

const Marketplace: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<Event[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<Event[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slots, myEvents] = await Promise.all([
        swapAPI.getSwappableSlots(),
        eventAPI.getMyEvents(),
      ]);
      setAvailableSlots(slots);
      setMySwappableSlots(myEvents.filter((e) => e.status === EventStatus.SWAPPABLE));
    } catch (err: any) {
      setError('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot: Event) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleConfirmSwap = async (mySlotId: string) => {
    if (!selectedSlot) return;

    setError('');
    setSuccess('');

    try {
      await swapAPI.createSwapRequest(mySlotId, selectedSlot._id);
      setSuccess('Swap request sent successfully!');
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create swap request');
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

  const getOwnerName = (event: Event): string => {
    if (typeof event.userId === 'object' && 'name' in event.userId) {
      return (event.userId as User).name;
    }
    return 'Unknown';
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Marketplace</h1>
        <p className="subtitle">Browse and request swappable time slots from other users</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="events-grid">
        {availableSlots.length === 0 ? (
          <p className="empty-state">No swappable slots available at the moment.</p>
        ) : (
          availableSlots.map((slot) => (
            <div key={slot._id} className="event-card marketplace-card">
              <div className="card-header">
                <h3>{slot.title}</h3>
                <span className="owner-badge">by {getOwnerName(slot)}</span>
              </div>
              <p className="event-time">
                {formatDate(slot.startTime)} - {formatDate(slot.endTime)}
              </p>
              <button className="btn-primary" onClick={() => handleRequestSwap(slot)}>
                Request Swap
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select Your Slot to Offer</h2>
            <div className="selected-slot-info">
              <p>
                <strong>You want:</strong> {selectedSlot.title}
              </p>
              <p className="event-time">
                {formatDate(selectedSlot.startTime)} - {formatDate(selectedSlot.endTime)}
              </p>
            </div>

            <div className="my-slots-list">
              {mySwappableSlots.length === 0 ? (
                <p className="empty-state">
                  You don't have any swappable slots. Go to your dashboard to make a slot
                  swappable.
                </p>
              ) : (
                mySwappableSlots.map((slot) => (
                  <div key={slot._id} className="slot-option">
                    <div>
                      <h4>{slot.title}</h4>
                      <p className="event-time">
                        {formatDate(slot.startTime)} - {formatDate(slot.endTime)}
                      </p>
                    </div>
                    <button className="btn-primary" onClick={() => handleConfirmSwap(slot._id)}>
                      Offer This
                    </button>
                  </div>
                ))
              )}
            </div>

            <button className="btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;