"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await fetch(`/api/invoices/${invoice._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setUpdating(false);
  };

  const downloadPDF = () => {
    fetch("/logo.b64")
      .then((res) => res.text())
      .then((base64) => {
        generatePDF(base64);
      })
      .catch(() => {
        generatePDF(null);
      });
  };

  const generatePDF = (base64: string | null) => {
    const doc = new jsPDF();

    // Logo
    if (base64) {
      try {
        doc.addImage(base64, "PNG", 14, 10, 40, 10);
      } catch {
        // skip if image fails
      }
    }

    // Invoice number
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(invoice.invoiceNumber, 14, 28);

    // Dates
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Issue Date: ${new Date(invoice.issueDate).toLocaleDateString("en-GB")}`,
      14,
      38,
    );
    doc.text(
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}`,
      14,
      45,
    );

    // Client
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Billed To:", 14, 58);
    doc.setFontSize(10);
    doc.text(invoice.clientName, 14, 65);
    doc.setTextColor(100, 100, 100);
    doc.text(invoice.clientEmail, 14, 72);

    // Line items table
    autoTable(doc, {
      startY: 83,
      head: [["Description", "Qty", "Rate (£)", "Amount (£)"]],
      body: invoice.items.map((item) => [
        item.description,
        item.quantity.toString(),
        item.rate.toFixed(2),
        item.amount.toFixed(2),
      ]),
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 10,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Subtotal: £${invoice.subtotal.toFixed(2)}`, 140, finalY);

    if (invoice.tax > 0) {
      const taxAmount = invoice.total - invoice.subtotal;
      doc.text(
        `Tax (${invoice.tax}%): £${taxAmount.toFixed(2)}`,
        140,
        finalY + 7,
      );
    }

    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total: £${invoice.total.toFixed(2)}`,
      140,
      finalY + (invoice.tax > 0 ? 17 : 10),
    );

    // Notes
    if (invoice.notes) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Notes:", 14, finalY + 20);
      doc.text(invoice.notes, 14, finalY + 27);
    }

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const statuses = ["draft", "pending", "paid", "overdue"];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {/* Status updater */}
      <select
        value={invoice.status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={updating}
        className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      {/* Download PDF */}
      <button
        onClick={downloadPDF}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        <span>⬇</span> Download PDF
      </button>
    </div>
  );
}
