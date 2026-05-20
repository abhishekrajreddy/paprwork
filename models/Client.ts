import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  userId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

const ClientSchema = new Schema<IClient>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);