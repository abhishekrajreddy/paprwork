import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const invoices = await Invoice.find({ userId: session!.user.id }).sort({ createdAt: -1 });

  const statusStyles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          + New Invoice
        </Link>
      </div>

      {/* Empty state */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-gray-900 font-semibold mb-1">No invoices yet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Create your first invoice and start getting paid
          </p>
          <Link
            href="/invoices/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-2">Invoice</div>
            <div>Client</div>
            <div>Due Date</div>
            <div>Amount</div>
            <div>Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {invoices.map((invoice) => (
              <Link
                key={invoice._id.toString()}
                href={`/invoices/${invoice._id}`}
                className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
              >
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Issued {formatDate(invoice.issueDate)}
                  </p>
                </div>
                <div className="text-sm text-gray-600">{invoice.clientName}</div>
                <div className="text-sm text-gray-600">{formatDate(invoice.dueDate)}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(invoice.total)}
                </div>
                <div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[invoice.status]}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}