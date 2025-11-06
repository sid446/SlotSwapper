import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Event, { EventStatus } from '../models/Event';

export const getMyEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ userId: req.userId }).sort({ startTime: 1 });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, startTime, endTime } = req.body;

    if (!title || !startTime || !endTime) {
      res.status(400).json({ error: 'Please provide title, startTime, and endTime' });
      return;
    }

    const event = await Event.create({
      userId: req.userId,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: EventStatus.BUSY
    });

    res.status(201).json({ message: 'Event created', event });
  } catch (error: any) {
    console.error('Create event error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, status } = req.body;

    const event = await Event.findOne({ _id: id, userId: req.userId });
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status === EventStatus.SWAP_PENDING) {
      res.status(400).json({ error: 'Cannot update event with pending swap' });
      return;
    }

    if (title) event.title = title;
    if (startTime) event.startTime = new Date(startTime);
    if (endTime) event.endTime = new Date(endTime);
    if (status) event.status = status;

    await event.save();

    res.status(200).json({ message: 'Event updated', event });
  } catch (error: any) {
    console.error('Update event error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ _id: id, userId: req.userId });
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status === EventStatus.SWAP_PENDING) {
      res.status(400).json({ error: 'Cannot delete event with pending swap' });
      return;
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};