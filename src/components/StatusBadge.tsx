import type { NewsStatus } from '../types/api';
import styles from './StatusBadge.module.scss';

const STATUS_LABELS: Record<NewsStatus, string> = {
  draft: 'Черновик',
  scheduled: 'Запланирована',
  published: 'Опубликована',
};

const STATUS_CLASS: Record<NewsStatus, string> = {
  draft: styles.draft,
  scheduled: styles.scheduled,
  published: styles.published,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function StatusBadge({ status, publishAt }: { status: NewsStatus; publishAt?: string }) {
  const label =
    status === 'scheduled' && publishAt !== undefined
      ? `${STATUS_LABELS[status]} на ${formatDate(publishAt)}`
      : STATUS_LABELS[status];

  return <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>{label}</span>;
}
