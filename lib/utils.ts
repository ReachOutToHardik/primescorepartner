export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]) {
  return classes
    .flatMap((c) => {
      if (!c) return [];
      if (typeof c === 'string') return c;
      if (typeof c === 'object') {
        return Object.entries(c)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(' ');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPoints(pts: number): string {
  return pts.toLocaleString('en-IN');
}

export function generateId(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${year}-${rand}`;
}

export function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'completed':
      return { bg: '#EBF7ED', text: '#1E7B30', dot: '#3DAA4B' };
    case 'in_progress':
      return { bg: '#EEF2FF', text: '#3730A3', dot: '#4F46E5' };
    case 'enrolled':
      return { bg: '#FEF9E7', text: '#92610A', dot: '#F5C518' };
    case 'received':
      return { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' };
    case 'submitted':
      return { bg: '#F5F4F0', text: '#6B6764', dot: '#9C9893' };
    case 'rejected':
      return { bg: '#FDECEA', text: '#B91C1C', dot: '#E63329' };
    case 'kyc_approved':
      return { bg: '#EBF7ED', text: '#1E7B30', dot: '#3DAA4B' };
    case 'kyc_submitted':
      return { bg: '#FEF9E7', text: '#92610A', dot: '#F5C518' };
    case 'pending_kyc':
      return { bg: '#F5F4F0', text: '#6B6764', dot: '#9C9893' };
    case 'kyc_rejected':
      return { bg: '#FDECEA', text: '#B91C1C', dot: '#E63329' };
    default:
      return { bg: '#F5F4F0', text: '#6B6764', dot: '#9C9893' };
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    received: 'Received',
    enrolled: 'Enrolled',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
    pending_kyc: 'Pending KYC',
    kyc_submitted: 'KYC Submitted',
    kyc_approved: 'KYC Approved',
    kyc_rejected: 'KYC Rejected',
  };
  return labels[status] || status;
}

export function getTierInfo(points: number) {
  if (points >= 20000)
    return { tier: 'Platinum', next: null, progress: 100, color: '#94a3b8', nextThreshold: 20000 };
  if (points >= 5000)
    return { tier: 'Gold', next: 'Platinum', progress: Math.round(((points - 5000) / 15000) * 100), color: '#F5C518', nextThreshold: 20000 };
  return { tier: 'Silver', next: 'Gold', progress: Math.round((points / 5000) * 100), color: '#9C9893', nextThreshold: 5000 };
}
