import { colors } from '@/tokens';

export function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours >= 1) return `${diffHours}h ago`;
  return `${diffMins}m ago`;
}

export function getTimeColor(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffHours = (now.getTime() - past.getTime()) / 3600000;
  if (diffHours >= 6) return colors.ember;
  if (diffHours >= 2) return '#D97706'; // Amber
  return colors.inkWhisper;
}
