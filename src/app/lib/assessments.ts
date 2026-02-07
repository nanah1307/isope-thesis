export type Comment = {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
};

export type Assessment = {
  id: string;
  orgUsername: string;
  requirementId: string;
  submittedAt: Date | null;
  answers: Record<string, string>;
  comments: Comment[];
  score: number;
  graded: boolean;
  feedback?: string;
};

export function formatTimestamp(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    const hrs = Math.floor(diff / 3600);
    return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatName(name: string): string {
  return name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .toUpperCase();
}

export function saveCommentsToLocalStorage(
  orgUsername: string,
  requirementId: string,
  comments: Comment[]
): void {
  const storageKey = `comments_${orgUsername}_${requirementId}`;
  localStorage.setItem(storageKey, JSON.stringify(comments));
}

export function validateAndCorrectScore(value: string | number): number {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num)) return 0;
  if (num > 100) return 100;
  if (num < 1) return 1;
  return num;
}
