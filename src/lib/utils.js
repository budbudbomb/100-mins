/**
 * Utility functions for formatting, date handling, and helpers
 */

/**
 * Format a date as relative time (e.g., "5 min ago")
 */
export function timeAgo(dateStr, lang = 'en') {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (lang === 'hi') {
    if (diffMin < 1) return 'अभी';
    if (diffMin < 60) return `${diffMin} मिनट पहले`;
    if (diffHr < 24) return `${diffHr} घंटे पहले`;
    return `${diffDays} दिन पहले`;
  }

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Format a date for display
 */
export function formatDateTime(dateStr, lang = 'en') {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time only
 */
export function formatTime(dateStr, lang = 'en') {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLen = 80) {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '…';
}

/**
 * Generate a simple unique ID
 */
export function generateId(prefix = '') {
  const rand = Math.random().toString(36).substring(2, 8);
  const time = Date.now().toString(36);
  return prefix ? `${prefix}-${time}${rand}` : `${time}${rand}`;
}

/**
 * Mask phone number for privacy
 */
export function maskPhone(phone) {
  if (!phone) return '—';
  if (phone.length <= 6) return '****';
  return phone.substring(0, 4) + '****' + phone.substring(phone.length - 4);
}

/**
 * Get category icon name (Lucide icon name)
 */
export function getCategoryIcon(category) {
  const icons = {
    BOOTH_CAPTURING: 'ShieldAlert',
    BRIBERY: 'Banknote',
    CODE_OF_CONDUCT: 'FileWarning',
    CAMPAIGN_MALPRACTICE: 'Megaphone',
  };
  return icons[category] || 'AlertCircle';
}

/**
 * Get status color class
 */
export function getStatusColor(status) {
  const colors = {
    SUBMITTED: '#6366f1',
    UNDER_REVIEW: '#f59e0b',
    ALERT_DISPATCHED: '#3b82f6',
    EN_ROUTE: '#8b5cf6',
    FIRST_ACTION_LOGGED: '#10b981',
    RESOLVED: '#059669',
    ESCALATED: '#ef4444',
    DUPLICATE: '#6b7280',
    FALSE_COMPLAINT: '#6b7280',
  };
  return colors[status] || '#6b7280';
}

/**
 * Debounce function
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Simple offline detection
 */
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Local storage helper with JSON serialization
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};
