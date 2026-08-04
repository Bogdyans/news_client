import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createNews, getNews, publishNews, updateNews } from '../api/news';
import { ApiRequestError } from '../api/client';
import type { NewsStatus } from '../types/api';
import type { Block } from '../editor/blocks/types';
import { blocksToMarkdown } from '../editor/blocks/serialize';
import { parseMarkdownToBlocks } from '../editor/blocks/parse';
import { BlockView } from '../editor/blocks/BlockView';
import { ArticleBlocksEditor } from '../editor/ArticleBlocksEditor';
import { StatusBadge } from '../components/StatusBadge';
import styles from './ArticleEditorPage.module.scss';

const PLACEHOLDER_TITLE = 'Новая статья';
const PLACEHOLDER_CONTENT = 'Начните писать здесь...';

/**
 * Страница редактора
 */
export function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [newsId, setNewsId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [status, setStatus] = useState<NewsStatus>('draft');
  const [publishAt, setPublishAt] = useState<string | undefined>(undefined);
  const [scheduleValue, setScheduleValue] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Новая статья: сразу создаём черновик на сервере и переходим в режим редактирования
  useEffect(() => {
    if (id !== undefined || token === null) return;

    let cancelled = false;

    createNews(token, { title: PLACEHOLDER_TITLE, content: PLACEHOLDER_CONTENT })
      .then((result) => {
        if (!cancelled) navigate(`/articles/${result.news.id}/edit`, { replace: true });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : 'Не удалось создать статью.');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, token, navigate]);

  // Существующая статья: загружаем и разбираем content обратно в блоки
  useEffect(() => {
    if (id === undefined || token === null) return;

    let cancelled = false;
    setIsLoading(true);

    getNews(token, id)
      .then((result) => {
        if (cancelled) return;
        setNewsId(result.news.id);
        setTitle(result.news.title);
        setBlocks(parseMarkdownToBlocks(result.news.content));
        setStatus(result.news.status);
        setPublishAt(result.news.publishAt);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : 'Не удалось загрузить статью.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  async function handleSave(): Promise<boolean> {
    if (newsId === null || token === null) return false;

    const trimmedTitle = title.trim();
    const markdown = blocksToMarkdown(blocks);

    if (trimmedTitle.length < 3) {
      setError('Заголовок должен содержать не менее 3 символов.');
      return false;
    }
    if (markdown.trim().length < 10) {
      setError('Добавьте немного содержимого в статью.');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateNews(token, newsId, { title: trimmedTitle, content: markdown });
      return true;
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Не удалось сохранить статью.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishNow() {
    if (!(await handleSave()) || newsId === null || token === null) return;

    try {
      const result = await publishNews(token, newsId);
      setStatus(result.news.status);
      setPublishAt(result.news.publishAt);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Не удалось опубликовать статью.');
    }
  }

  async function handleSchedule() {
    if (scheduleValue === '') {
      setError('Укажите дату и время публикации.');
      return;
    }
    if (!(await handleSave()) || newsId === null || token === null) return;

    try {
      const result = await publishNews(token, newsId, new Date(scheduleValue).toISOString());
      setStatus(result.news.status);
      setPublishAt(result.news.publishAt);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Не удалось запланировать публикацию.');
    }
  }

  async function handleUnschedule() {
    if (newsId === null || token === null) return;

    try {
      const result = await updateNews(token, newsId, { publishAt: null });
      setStatus(result.news.status);
      setPublishAt(undefined);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Не удалось снять с расписания.');
    }
  }

  if (isLoading) {
    return <p>Загрузка…</p>;
  }

  if (newsId === null || token === null) {
    return error !== null ? <p className={styles.error}>{error}</p> : null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <input
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Заголовок статьи"
        />
        <StatusBadge status={status} publishAt={publishAt} />
      </div>

      {error !== null && <p className={styles.error}>{error}</p>}

      <div className={styles.toggleRow}>
        <button type="button" className={styles.toggleButton} onClick={() => setShowPreview((value) => !value)}>
          {showPreview ? '← Вернуться к редактированию' : 'Предпросмотр'}
        </button>
      </div>

      {showPreview ? (
        <article className={styles.previewArticle}>
          <h1>{title}</h1>
          {blocks.map((block) => (
            <BlockView key={block.id} block={block} />
          ))}
        </article>
      ) : (
        <ArticleBlocksEditor blocks={blocks} onChange={setBlocks} newsId={newsId} token={token} />
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
          Сохранить черновик
        </button>

        {status !== 'published' && (
          <>
            <button type="button" className={styles.publishButton} onClick={handlePublishNow} disabled={isSaving}>
              Опубликовать сейчас
            </button>

            <input
              type="datetime-local"
              className={styles.scheduleInput}
              value={scheduleValue}
              onChange={(event) => setScheduleValue(event.target.value)}
            />
            <button type="button" className={styles.saveButton} onClick={handleSchedule} disabled={isSaving}>
              Запланировать
            </button>

            {status === 'scheduled' && (
              <button type="button" className={styles.dangerButton} onClick={handleUnschedule}>
                Снять с расписания
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
