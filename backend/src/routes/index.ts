import express from 'express';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/auth.Controller';
import * as eventController from '../controllers/event.Controller';
import * as swapController from '../controllers/swap.Controller';

const router = express.Router();

// Auth routes (public)
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// Event routes (protected)
router.get('/events', authenticate, eventController.getMyEvents);
router.post('/events', authenticate, eventController.createEvent);
router.patch('/events/:id', authenticate, eventController.updateEvent);
router.delete('/events/:id', authenticate, eventController.deleteEvent);

// Swap routes (protected)
router.get('/swappable-slots', authenticate, swapController.getSwappableSlots);
router.post('/swap-request', authenticate, swapController.createSwapRequest);
router.post('/swap-response/:requestId', authenticate, swapController.respondToSwapRequest);
router.get('/swap-requests/incoming', authenticate, swapController.getIncomingRequests);
router.get('/swap-requests/outgoing', authenticate, swapController.getOutgoingRequests);

export default router;