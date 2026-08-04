import type { ReactNode } from 'react';
import styles from './BlockShell.module.scss';

interface Props {
  label: string;
  onDelete: () => void;
  children: ReactNode;
}

/** Общая обёртка для всех блоков в режиме редактирования: подпись типа + кнопка удаления */
export function BlockShell({ label, onDelete, children }: Props) {
  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <button type="button" className={styles.deleteButton} onClick={onDelete}>
          Удалить
        </button>
      </div>
      {children}
    </div>
  );
}
