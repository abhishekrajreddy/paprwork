import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import InvoiceActions from "@/components/InvoiceActions";
import Image from "next/image";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  await connectDB();

  let invoice;
  try {
    invoice = await Invoice.findOne({
      _id: id,
      userId: session!.user.id,
    }).lean();
  } catch {
    notFound();
  }

  if (!invoice) notFound();

  // Serialise for client components
  const invoiceData = JSON.parse(JSON.stringify(invoice));

  const statusStyles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            href="/invoices"
            className="text-sm text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1"
          >
            ← Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {invoiceData.invoiceNumber}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                statusStyles[invoiceData.status]
              }`}
            >
              {invoiceData.status.charAt(0).toUpperCase() +
                invoiceData.status.slice(1)}
            </span>
            <span className="text-sm text-gray-400">
              Due {formatDate(invoiceData.dueDate)}
            </span>
          </div>
        </div>
        <InvoiceActions invoice={invoiceData} />
      </div>

      {/* Invoice card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div>
              <Image
                src="/logo_dark_bg.png"
                alt="Paprwork"
                width={180}
                height={36}
                priority
                loading="eager"
                className="hover:opacity-80 transition-opacity block dark:hidden"
              />
              <Image
                src="/logo_white_bg.png"
                alt="Paprwork"
                width={180}
                height={36}
                priority
                loading="eager"
                className="hover:opacity-80 transition-opacity hidden dark:block"
              />
              {/* <h2 className="text-2xl font-bold text-gray-900">
                Papr<span className="text-blue-600">work</span>
              </h2>
              <p className="text-sm text-gray-400 mt-1">Freelance invoicing</p> */}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-semibold text-gray-900">
                {invoiceData.invoiceNumber}
              </p>
              <p className="text-sm text-gray-500 mt-2">Issue Date</p>
              <p className="text-sm text-gray-700">
                {formatDate(invoiceData.issueDate)}
              </p>
              <p className="text-sm text-gray-500 mt-2">Due Date</p>
              <p className="text-sm text-gray-700">
                {formatDate(invoiceData.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Client info */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Billed To
          </p>
          <p className="font-semibold text-gray-900">
            {invoiceData.clientName}
          </p>
          <p className="text-sm text-gray-500">{invoiceData.clientEmail}</p>
        </div>

        {/* Line items */}
        <div className="p-6">
          <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="space-y-2">
            {invoiceData.items.map((item: any, index: number) => (
              <div key={index} className="py-3 border-b border-gray-50">
                {/* Mobile layout */}
                <div className="sm:hidden">
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    {item.description}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {item.quantity} × {formatCurrency(item.rate)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-12 gap-3">
                  <div className="col-span-6 text-sm text-gray-900">
                    {item.description}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 text-center">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 text-center">
                    {formatCurrency(item.rate)}
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {invoiceData.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax ({invoiceData.tax}%)</span>
                <span>
                  {formatCurrency(invoiceData.total - invoiceData.subtotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(invoiceData.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoiceData.notes && (
          <div className="px-6 pb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Notes
            </p>
            <p className="text-sm text-gray-600">{invoiceData.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
