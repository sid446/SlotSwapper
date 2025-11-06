import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import Event, { EventStatus } from '../models/Event.js';
import SwapRequest, { SwapStatus } from '../models/SwapRequest.js';

export const getSwappableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slots = await Event.find({
      status: EventStatus.SWAPPABLE,
      userId: { $ne: req.userId }
    })
      .populate('userId', 'name email')
      .sort({ startTime: 1 });

    res.status(200).json({ slots });
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ error: 'Failed to fetch swappable slots' });
  }
};

export const createSwapRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId } = req.body;

    if (!mySlotId || !theirSlotId) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Please provide both mySlotId and theirSlotId' });
      return;
    }

    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);

    if (!mySlot || !theirSlot) {
      await session.abortTransaction();
      res.status(404).json({ error: 'One or both slots not found' });
      return;
    }

    if (mySlot.userId.toString() !== req.userId) {
      await session.abortTransaction();
      res.status(403).json({ error: 'You do not own the slot you are offering' });
      return;
    }

    if (theirSlot.userId.toString() === req.userId) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Cannot swap with your own slot' });
      return;
    }

    if (mySlot.status !== EventStatus.SWAPPABLE) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Your slot is not swappable' });
      return;
    }

    if (theirSlot.status !== EventStatus.SWAPPABLE) {
      await session.abortTransaction();
      res.status(400).json({ error: 'The requested slot is no longer swappable' });
      return;
    }

    const swapRequest = await SwapRequest.create([{
      requesterId: req.userId,
      receiverId: theirSlot.userId,
      requesterSlotId: mySlotId,
      receiverSlotId: theirSlotId,
      status: SwapStatus.PENDING
    }], { session });

    mySlot.status = EventStatus.SWAP_PENDING;
    theirSlot.status = EventStatus.SWAP_PENDING;

    await mySlot.save({ session });
    await theirSlot.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: 'Swap request created',
      swapRequest: swapRequest[0]
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Failed to create swap request' });
  } finally {
    session.endSession();
  }
};

export const respondToSwapRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { accepted } = req.body;

    if (typeof accepted !== 'boolean') {
      await session.abortTransaction();
      res.status(400).json({ error: 'Please provide accepted (true/false)' });
      return;
    }

    const swapRequest = await SwapRequest.findById(requestId).session(session);
    if (!swapRequest) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Swap request not found' });
      return;
    }

    if (swapRequest.receiverId.toString() !== req.userId) {
      await session.abortTransaction();
      res.status(403).json({ error: 'You are not authorized to respond to this request' });
      return;
    }

    if (swapRequest.status !== SwapStatus.PENDING) {
      await session.abortTransaction();
      res.status(400).json({ error: 'This swap request has already been processed' });
      return;
    }

    const requesterSlot = await Event.findById(swapRequest.requesterSlotId).session(session);
    const receiverSlot = await Event.findById(swapRequest.receiverSlotId).session(session);

    if (!requesterSlot || !receiverSlot) {
      await session.abortTransaction();
      res.status(404).json({ error: 'One or both slots no longer exist' });
      return;
    }

    if (accepted) {
      const tempUserId = requesterSlot.userId;
      requesterSlot.userId = receiverSlot.userId;
      receiverSlot.userId = tempUserId;

      requesterSlot.status = EventStatus.BUSY;
      receiverSlot.status = EventStatus.BUSY;

      swapRequest.status = SwapStatus.ACCEPTED;

      await requesterSlot.save({ session });
      await receiverSlot.save({ session });
      await swapRequest.save({ session });

      await session.commitTransaction();

      res.status(200).json({
        message: 'Swap accepted',
        swapRequest
      });
    } else {
      requesterSlot.status = EventStatus.SWAPPABLE;
      receiverSlot.status = EventStatus.SWAPPABLE;

      swapRequest.status = SwapStatus.REJECTED;

      await requesterSlot.save({ session });
      await receiverSlot.save({ session });
      await swapRequest.save({ session });

      await session.commitTransaction();

      res.status(200).json({
        message: 'Swap rejected',
        swapRequest
      });
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Respond to swap request error:', error);
    res.status(500).json({ error: 'Failed to respond to swap request' });
  } finally {
    session.endSession();
  }
};

export const getIncomingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await SwapRequest.find({
      receiverId: req.userId,
      status: SwapStatus.PENDING
    })
      .populate('requesterId', 'name email')
      .populate('requesterSlotId')
      .populate('receiverSlotId')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get incoming requests error:', error);
    res.status(500).json({ error: 'Failed to fetch incoming requests' });
  }
};

export const getOutgoingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await SwapRequest.find({
      requesterId: req.userId,
      status: SwapStatus.PENDING
    })
      .populate('receiverId', 'name email')
      .populate('requesterSlotId')
      .populate('receiverSlotId')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get outgoing requests error:', error);
    res.status(500).json({ error: 'Failed to fetch outgoing requests' });
  }
};