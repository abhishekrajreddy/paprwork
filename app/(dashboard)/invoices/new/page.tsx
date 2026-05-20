"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateInvoiceNumber } from "@/lib/utils";

interface Client {
  _id: string;
  name: string;
  email: string;
  company?: string;
}

interface LineItem {
  description: string;
  quantity: number | string;
  rate: number | string;
  amount: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clientId: preselectedClientId || "",
    clientName: "",
    clientEmail: "",
    invoiceNumber: generateInvoiceNumber(),
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    tax: 0 as number | string,
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  // Fetch clients on mount
  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        // If preselected client, populate fields
        if (preselectedClientId) {
          const client = data.find(
            (c: Client) => c._id === preselectedClientId,
          );
          if (client) {
            setForm((prev) => ({
              ...prev,
              clientName: client.name,
              clientEmail: client.email,
            }));
          }
        }
      });
  }, [preselectedClientId]);

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c._id === clientId);
    if (client) {
      setForm((prev) => ({
        ...prev,
        clientId,
        clientName: client.name,
        clientEmail: client.email,
      }));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: string,
  ) => {
    const updated = [...items];
    const numericFields = ["quantity", "rate"];

    if (numericFields.includes(field)) {
      // Allow empty string while typing, store as string temporarily
      (updated[index] as any)[field] =
        value === "" ? "" : parseFloat(value) || 0;
    } else {
      (updated[index] as any)[field] = value;
    }

    // Only recalculate if both values are numbers
    const qty = parseFloat(String(updated[index].quantity)) || 0;
    const rate = parseFloat(String(updated[index].rate)) || 0;
    updated[index].amount = qty * rate;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = parseFloat(String(form.tax)) || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate line items
    for (let i = 0; i < items.length; i++) {
      const qty = parseFloat(String(items[i].quantity)) || 0;
      const rate = parseFloat(String(items[i].rate)) || 0;

      if (!items[i].description.trim()) {
        setError(`Line item ${i + 1}: description cannot be empty.`);
        setLoading(false);
        return;
      }
      if (qty <= 0) {
        setError(`Line item ${i + 1}: quantity must be greater than 0.`);
        setLoading(false);
        return;
      }
      if (rate <= 0) {
        setError(`Line item ${i + 1}: rate must be greater than 0.`);
        setLoading(false);
        return;
      }
    }

    // Sanitise all numeric fields before submitting
    const sanitisedItems = items.map((item) => ({
      ...item,
      quantity: parseFloat(String(item.quantity)) || 0,
      rate: parseFloat(String(item.rate)) || 0,
      amount: item.amount,
    }));

    const sanitisedTax = parseFloat(String(form.tax)) || 0;

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tax: sanitisedTax,
          items: sanitisedItems,
          subtotal,
          total,
        }),
      });

      if (!res.ok) throw new Error("Failed to create invoice");
      const invoice = await res.json();
      router.push(`/invoices/${invoice._id}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
        <p className="text-gray-500 mt-1 text-sm">Fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Invoice details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={(e) =>
                  setForm({ ...form, invoiceNumber: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={form.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} {client.company ? `(${client.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) =>
                  setForm({ ...form, issueDate: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Line Items</h2>

          <div className="space-y-3">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Rate (£)</div>
              <div className="col-span-2 text-center">Amount</div>
              <div className="col-span-1" />
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    placeholder="e.g. Frontend development"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className={`w-full px-3 py-2 border rounded-xl text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
  (parseFloat(String(item.rate)) || 0) <= 0
    ? 'border-red-300 bg-red-50'
    : 'border-gray-200'
}`}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.rate}
                    min={0}
                    step={0.01}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className={`w-full px-3 py-2 border rounded-xl text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
  (parseFloat(String(item.rate)) || 0) <= 0
    ? 'border-red-300 bg-red-50'
    : 'border-gray-200'
}`}
                  />
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-900 text-center">
                  £{item.amount.toFixed(2)}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-30 transition-colors text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            + Add line item
          </button>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Tax (%)</span>
                <input
                  type="number"
                  value={form.tax}
                  min={0}
                  max={100}
                  onChange={(e) => {
                    setForm({ ...form, tax: e.target.value });
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span>£{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Payment terms, bank details, or any other notes..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
