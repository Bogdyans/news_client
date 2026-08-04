import { useState, type ChangeEvent } from 'react';
import type { ImageBlock } from './types';
import { BlockShell } from './BlockShell';
import { uploadAttachments } from '../../api/news';
import { ApiRequestError } from '../../api/client';
import { resolveAttachmentUrl } from '../../api/resolveAttachmentUrl';
import styles from './blockEditors.module.scss';

interface Props {
  block: ImageBlock;
  onChange: (next: ImageBlock) => void;
  onDelete: () => void;
  newsId: string;
  token: string;
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp';

export function ImageBlockEditor({ block, onChange, onDelete, newsId, token }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // сбрасываем value, чтобы можно было выбрать тот же файл ещё раз
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadAttachments(token, newsId, [file]);
      const uploadedPath = result.news.attachments[result.news.attachments.length - 1] ?? '';
      onChange({ ...block, url: uploadedPath, alt: block.alt || file.name });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Не удалось загрузить картинку.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <BlockShell label="Картинка" onDelete={onDelete}>
      {block.url === '' ? (
        <input type="file" accept={ACCEPTED_TYPES} onChange={handleFileSelect} disabled={isUploading} />
      ) : (
        <div className={styles.imagePreview}>
          <img src={resolveAttachmentUrl(block.url)} alt={block.alt} />
          <input
            type="text"
            className={styles.input}
            value={block.alt}
            onChange={(event) => onChange({ ...block, alt: event.target.value })}
            placeholder="Подпись к картинке (необязательно)"
          />
        </div>
      )}
      {isUploading && <p className={styles.hint}>Загрузка…</p>}
      {error !== null && <p className={styles.error}>{error}</p>}
    </BlockShell>
  );
}
