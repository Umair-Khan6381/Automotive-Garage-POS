// Currency, date, and text formatters for Dubai, UAE Automotive Workshop POS

export const DEFAULT_GARAGE_TIMEZONE = 'Asia/Dubai';

/**
 * Formats a monetary amount into standard UAE Dirham format: "AED 1,250.00"
 */
export const formatAED = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'AED 0.00';
  }
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `AED ${formattedNumber}`;
};

// Alias formatPKR to formatAED for complete backward compatibility across all modules
export const formatPKR = formatAED;

export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateStr: string | undefined | null, timeZone: string = DEFAULT_GARAGE_TIMEZONE): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatTime = (isoString: string | undefined | null, timeZone: string = DEFAULT_GARAGE_TIMEZONE): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return isoString;
  }
};

export const formatDateTime = (isoString: string | undefined | null, timeZone: string = DEFAULT_GARAGE_TIMEZONE): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const dateFormatted = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);

    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);

    return `${dateFormatted} ${timeFormatted}`;
  } catch {
    return isoString;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
