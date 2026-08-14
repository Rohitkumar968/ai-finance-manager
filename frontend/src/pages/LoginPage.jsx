import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import { loginUser, clearError } from '../features/auth/authSlice';
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your AI Finance journey "  >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
         <div className="relative">
         <Mail
           size={18}
           className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

         <input
           type="email"
           name="email"
           required
           placeholder="you@example.com"
           value={formData.email}
           onChange={handleChange}
           className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
           />
        </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <div className="relative">
        <Lock
           size={18}
           className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
         />

        <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-10 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
        />

         <button
           type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
         >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        </div>
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
           className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
        >
        <LogIn size={18} />
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
