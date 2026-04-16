export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyDetailed = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number, decimals = 1): string => {
  return `${(value).toFixed(decimals)}%`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value).toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const formatDateLong = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
};

export const getRiskColor = (score: number): string => {
  if (score <= 2) return 'text-green-500';
  if (score <= 4) return 'text-blue-500';
  if (score <= 6) return 'text-yellow-500';
  if (score <= 8) return 'text-orange-500';
  return 'text-red-500';
};

export const getRiskBg = (score: number): string => {
  if (score <= 2) return 'bg-green-50 border-green-200';
  if (score <= 4) return 'bg-blue-50 border-blue-200';
  if (score <= 6) return 'bg-yellow-50 border-yellow-200';
  if (score <= 8) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
};

export const calculateGainLoss = (
  currentValue: number,
  investedValue: number
): { amount: number; percentage: number } => {
  const amount = currentValue - investedValue;
  const percentage = (amount / investedValue) * 100;
  return { amount, percentage };
};

export const getGainLossColor = (percentage: number): string => {
  return percentage >= 0 ? 'text-green-500' : 'text-red-500';
};
