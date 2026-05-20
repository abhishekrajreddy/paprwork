export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${random}`;
}

export function calculateDueStatus(dueDate: Date | string): 'paid' | 'overdue' | 'pending' {
  const today = new Date();
  const due = new Date(dueDate);
  if (due < today) return 'overdue';
  return 'pending';
}