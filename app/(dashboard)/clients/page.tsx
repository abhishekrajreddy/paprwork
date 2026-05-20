import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import Link from "next/link";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const clients = await Client.find({ userId: session!.user.id }).sort({
    createdAt: -1,
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Clients
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/clients/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          + Add Client
        </Link>
      </div>

      {/* Empty state */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-gray-900 font-semibold mb-1">No clients yet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Add your first client to start creating invoices
          </p>
          <Link
            href="/clients/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client._id.toString()}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-blue-200 transition-all"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-4">
                {client.name.charAt(0).toUpperCase()}
              </div>

              <h3 className="font-semibold text-gray-900">{client.name}</h3>
              {client.company && (
                <p className="text-sm text-gray-400 mt-0.5">{client.company}</p>
              )}

              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span>✉️</span> {client.email}
                </p>
                {client.phone && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span>📞</span> {client.phone}
                  </p>
                )}
                {client.address && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span>📍</span> {client.address}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                <Link
                  href={`/invoices/new?clientId=${client._id}`}
                  className="flex-1 text-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors"
                >
                  New Invoice
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
