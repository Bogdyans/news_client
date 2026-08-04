import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.scss';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div>
      <header className={styles.header}>
        <Link to="/articles" className={styles.brand}>
          News Editor
        </Link>
        <div className={styles.right}>
          {user !== null && <span className={styles.userName}>{user.name}</span>}
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
