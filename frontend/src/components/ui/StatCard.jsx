import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const StatCard = ({
  label,
  value,
  icon,
  accent = "primary",
  trend = "+12%",
  isLoading,
}) => {
  const accentClasses = {
    primary:
      "text-blue-600 bg-blue-100 dark:bg-blue-500/20",
    success:
      "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20",
    danger:
      "text-red-600 bg-red-100 dark:bg-red-500/20",
  };

  if (isLoading) {
    return <div className="skeleton h-32 w-full rounded-2xl" />;
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg p-6"
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl"></div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>

          <div className="mt-3 flex items-center gap-1 text-emerald-500 text-sm font-medium">
            <TrendingUp size={16} />
            {trend} this month
          </div>
        </div>

        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;