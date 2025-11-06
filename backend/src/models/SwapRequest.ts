import mongoose, { Document, Schema } from 'mongoose';

export enum SwapStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface ISwapRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  requesterSlotId: mongoose.Types.ObjectId;
  receiverSlotId: mongoose.Types.ObjectId;
  status: SwapStatus;
  createdAt: Date;
}

const swapRequestSchema = new Schema<ISwapRequest>({
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterSlotId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  receiverSlotId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SwapStatus),
    default: SwapStatus.PENDING
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ receiverId: 1, status: 1 });

export default mongoose.model<ISwapRequest>('SwapRequest', swapRequestSchema);