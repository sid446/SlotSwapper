import axios from 'axios';
import { AuthResponse, Event, SwapRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/signup', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
};

// Event API
export const eventAPI = {
  getMyEvents: async (): Promise<Event[]> => {
    const { data } = await api.get<{ events: Event[] }>('/events');
    return data.events;
  },

  createEvent: async (eventData: {
    title: string;
    startTime: string;
    endTime: string;
  }): Promise<Event> => {
    const { data } = await api.post<{ event: Event }>('/events', eventData);
    return data.event;
  },

  updateEvent: async (
    id: string,
    eventData: Partial<{
      title: string;
      startTime: string;
      endTime: string;
      status: string;
    }>
  ): Promise<Event> => {
    const { data } = await api.patch<{ event: Event }>(`/events/${id}`, eventData);
    return data.event;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

// Swap API
export const swapAPI = {
  getSwappableSlots: async (): Promise<Event[]> => {
    const { data } = await api.get<{ slots: Event[] }>('/swappable-slots');
    return data.slots;
  },

  createSwapRequest: async (mySlotId: string, theirSlotId: string): Promise<SwapRequest> => {
    const { data } = await api.post<{ swapRequest: SwapRequest }>('/swap-request', {
      mySlotId,
      theirSlotId,
    });
    return data.swapRequest;
  },

  respondToSwapRequest: async (requestId: string, accepted: boolean): Promise<SwapRequest> => {
    const { data } = await api.post<{ swapRequest: SwapRequest }>(
      `/swap-response/${requestId}`,
      { accepted }
    );
    return data.swapRequest;
  },

  getIncomingRequests: async (): Promise<SwapRequest[]> => {
    const { data } = await api.get<{ requests: SwapRequest[] }>('/swap-requests/incoming');
    return data.requests;
  },

  getOutgoingRequests: async (): Promise<SwapRequest[]> => {
    const { data } = await api.get<{ requests: SwapRequest[] }>('/swap-requests/outgoing');
    return data.requests;
  },
};

export default api;