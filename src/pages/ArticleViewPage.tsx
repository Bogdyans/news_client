import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNews } from '../api/news';
import { formatApiError } from '../utils/formatApiError';
import type { News } from '../types/api';
import { parseMarkdownToBlocks } from '../editor/blocks/parse';
import { BlockView } from '../editor/blocks/BlockView';
import { StatusBadge } from '../components/StatusBadge';
import styles from './ArticleViewPage.module.scss';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ArticleViewPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined || token === null) return;

    let cancelled = false;
    setIsLoading(true);

    getNews(token, id)
      .then((result) => {
        if (!cancelled) setNews(result.news);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(formatApiError(err, 'Не удалось загрузить статью.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  return (
    <div className={styles.page}>
      <Link to="/articles" className={styles.backLink}>
        ← К списку статей
      </Link>

      {isLoading && <p>Загрузка…</p>}
      {error !== null && <p className={styles.error}>{error}</p>}

      {news !== null && (
        <article>
          <h1>{news.title}</h1>
          <div className={styles.meta}>
            <span>{news.author.name}</span>
            <StatusBadge status={news.status} publishAt={news.publishAt} />
            {news.publishedAt !== undefined && <span>{formatDate(news.publishedAt)}</span>}
          </div>

          {parseMarkdownToBlocks(news.content).map((block) => (
            <BlockView key={block.id} block={block} />
          ))}
        </article>
      )}
    </div>
  );
}
