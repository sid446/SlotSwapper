export interface User {
  id: string;
  name: string;
  email: string;
}

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

export interface Event {
  _id: string;
  userId: string | User;
  title: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  createdAt: string;
}

export enum SwapStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface SwapRequest {
  _id: string;
  requesterId: string | User;
  receiverId: string | User;
  requesterSlotId: string | Event;
  receiverSlotId: string | Event;
  status: SwapStatus;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}