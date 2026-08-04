import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{ maxWidth: 480, margin: '4em auto', textAlign: 'center' }}>
      <h1>404</h1>
      <p>Такой страницы не существует.</p>
      <Link to="/articles">На главную</Link>
    </div>
  );
}
