import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const [invoices, clients] = await Promise.all([
    Invoice.find({ userId: session!.user.id }),
    Client.find({ userId: session!.user.id }),
  ]);

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  const recentInvoices = invoices
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: "💷",
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Pending",
      value: formatCurrency(pendingAmount),
      icon: "⏳",
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      label: "Overdue",
      value: formatCurrency(overdueAmount),
      icon: "🚨",
      color: "bg-red-50 text-red-700",
    },
    {
      label: "Total Clients",
      value: clients.length.toString(),
      icon: "👥",
      color: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good to see you, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's what's happening with your invoices
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg mb-3 ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
          <Link
            href="/invoices"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-500 text-sm">No invoices yet</p>
            <Link
              href="/invoices/new"
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first invoice →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentInvoices.map((invoice) => (
              <Link
                key={invoice._id.toString()}
                href={`/invoices/${invoice._id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {invoice.clientName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : invoice.status === "overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Link
          href="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 transition-colors"
        >
          <div className="text-2xl mb-2">➕</div>
          <div className="font-semibold">New Invoice</div>
          <div className="text-blue-200 text-sm mt-0.5">
            Create and send instantly
          </div>
        </Link>
        <Link
          href="/clients/new"
          className="bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl p-5 transition-colors shadow-sm"
        >
          <div className="text-2xl mb-2">👤</div>
          <div className="font-semibold text-gray-900">Add Client</div>
          <div className="text-gray-400 text-sm mt-0.5">
            Save client details
          </div>
        </Link>
      </div>
    </div>
  );
}
