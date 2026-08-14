import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import { forgotPassword } from '../features/auth/authSlice';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
      toast.success('Reset link sent if the account exists.');
    } else {
      toast.error(result.payload || 'Something went wrong');
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="We'll email you a reset link">
      {sent ? (
        <div className="text-center">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            If an account with that email exists, a password reset link has been sent. Check your inbox.
          </p>
          <Link to="/login" className="btn-secondary inline-flex">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Sending...' : 'Send reset link'}
          </button>
          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
