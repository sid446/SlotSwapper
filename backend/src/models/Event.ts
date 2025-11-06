import mongoose, { Document, Schema } from 'mongoose';

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  startTime: Date;
  endTime: Date;
  status: EventStatus;
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(this: IEvent, value: Date) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: Object.values(EventStatus),
    default: EventStatus.BUSY
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying swappable slots efficiently
eventSchema.index({ status: 1, userId: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);