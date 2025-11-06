import React, { useState, useEffect } from 'react';
import { swapAPI } from '../services/api';
import { SwapRequest, Event, User } from '../types';
import './Requests.css';

const Requests: React.FC = () => {
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [incoming, outgoing] = await Promise.all([
        swapAPI.getIncomingRequests(),
        swapAPI.getOutgoingRequests(),
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (err: any) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, accepted: boolean) => {
    setError('');
    setSuccess('');

    try {
      await swapAPI.respondToSwapRequest(requestId, accepted);
      setSuccess(accepted ? 'Swap accepted!' : 'Swap rejected');
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to respond to swap request');
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

  const getSlotInfo = (slot: string | Event) => {
    if (typeof slot === 'object') {
      return slot;
    }
    return null;
  };

  const getUserName = (user: string | User) => {
    if (typeof user === 'object' && 'name' in user) {
      return user.name;
    }
    return 'Unknown';
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <h1>Swap Requests</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="requests-section">
        <h2>Incoming Requests</h2>
        {incomingRequests.length === 0 ? (
          <p className="empty-state">No incoming requests</p>
        ) : (
          <div className="requests-list">
            {incomingRequests.map((request) => {
              const theirSlot = getSlotInfo(request.requesterSlotId);
              const mySlot = getSlotInfo(request.receiverSlotId);
              return (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <h3>{getUserName(request.requesterId)} wants to swap</h3>
                    <span className="request-date">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="request-details">
                    <div className="slot-detail">
                      <h4>They offer:</h4>
                      {theirSlot && (
                        <>
                          <p className="slot-title">{theirSlot.title}</p>
                          <p className="event-time">
                            {formatDate(theirSlot.startTime)} - {formatDate(theirSlot.endTime)}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="swap-arrow">⇄</div>
                    <div className="slot-detail">
                      <h4>For your:</h4>
                      {mySlot && (
                        <>
                          <p className="slot-title">{mySlot.title}</p>
                          <p className="event-time">
                            {formatDate(mySlot.startTime)} - {formatDate(mySlot.endTime)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn-success"
                      onClick={() => handleResponse(request._id, true)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleResponse(request._id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="requests-section">
        <h2>Outgoing Requests</h2>
        {outgoingRequests.length === 0 ? (
          <p className="empty-state">No outgoing requests</p>
        ) : (
          <div className="requests-list">
            {outgoingRequests.map((request) => {
              const mySlot = getSlotInfo(request.requesterSlotId);
              const theirSlot = getSlotInfo(request.receiverSlotId);
              return (
                <div key={request._id} className="request-card outgoing">
                  <div className="request-header">
                    <h3>Request to {getUserName(request.receiverId)}</h3>
                    <span className="status-badge pending">Pending</span>
                  </div>
                  <div className="request-details">
                    <div className="slot-detail">
                      <h4>You offered:</h4>
                      {mySlot && (
                        <>
                          <p className="slot-title">{mySlot.title}</p>
                          <p className="event-time">
                            {formatDate(mySlot.startTime)} - {formatDate(mySlot.endTime)}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="swap-arrow">⇄</div>
                    <div className="slot-detail">
                      <h4>For their:</h4>
                      {theirSlot && (
                        <>
                          <p className="slot-title">{theirSlot.title}</p>
                          <p className="event-time">
                            {formatDate(theirSlot.startTime)} - {formatDate(theirSlot.endTime)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;