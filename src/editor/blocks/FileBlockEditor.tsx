import { useState, type ChangeEvent } from 'react';
import type { FileBlock } from './types';
import { BlockShell } from './BlockShell';
import { uploadAttachments } from '../../api/news';
import { ApiRequestError } from '../../api/client';
import styles from './blockEditors.module.scss';

interface Props {
  block: FileBlock;
  onChange: (next: FileBlock) => void;
  onDelete: () => void;
  newsId: string;
  token: string;
}

const ACCEPTED_TYPES = '.pdf,.doc,.docx';

export function FileBlockEditor({ block, onChange, onDelete, newsId, token }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadAttachments(token, newsId, [file]);
      const uploadedPath = result.news.attachments[result.news.attachments.length - 1] ?? '';
      onChange({ ...block, url: uploadedPath, filename: file.name });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Не удалось загрузить файл.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <BlockShell label="Файл" onDelete={onDelete}>
      {block.url === '' ? (
        <input type="file" accept={ACCEPTED_TYPES} onChange={handleFileSelect} disabled={isUploading} />
      ) : (
        <p className={styles.fileName}>📎 {block.filename}</p>
      )}
      {isUploading && <p className={styles.hint}>Загрузка…</p>}
      {error !== null && <p className={styles.error}>{error}</p>}
    </BlockShell>
  );
}
