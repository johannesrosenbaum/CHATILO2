export const formatMessageTime = (timestamp: Date | string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'Jetzt';
  } else if (diffMinutes < 60) {
    return `vor ${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `vor ${diffHours}h`;
  } else if (diffDays < 7) {
    return `vor ${diffDays}d`;
  } else {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
};

export const formatFullDateTime = (timestamp: Date | string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
