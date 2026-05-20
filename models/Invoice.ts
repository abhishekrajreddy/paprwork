import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  userId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>({
  userId: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'overdue'],
    default: 'pending',
  },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);