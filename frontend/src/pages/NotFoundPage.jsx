import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-surface-dark text-center px-4">
    <p className="text-6xl">🧭</p>
    <h1 className="text-3xl font-bold">Page not found</h1>
    <p className="text-gray-500">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
