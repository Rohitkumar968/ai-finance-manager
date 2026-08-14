import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {Sparkles,Brain,TriangleAlert,Lightbulb,RefreshCw,Activity,} from "lucide-react";
import {fetchSpendingAnalysis,fetchRecommendations,fetchOverspendingAlerts,} from '../../features/ai/aiSlice';


const AIInsightsCard = () => {
  const dispatch = useDispatch();
  const { spendingAnalysis, recommendations, overspendingAlerts, isLoading, error } = useSelector(
    (state) => state.ai
  );
  const [tab, setTab] = useState('analysis');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      dispatch(fetchSpendingAnalysis());
      dispatch(fetchRecommendations());
      dispatch(fetchOverspendingAlerts());
      setHasLoaded(true);
    }
  }, [dispatch, hasLoaded]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleRefresh = () => {
    if (tab === 'analysis') dispatch(fetchSpendingAnalysis());
    if (tab === 'recommendations') dispatch(fetchRecommendations());
    if (tab === 'alerts') dispatch(fetchOverspendingAlerts());
  };

  const tabs = [
    { id: 'analysis', label: '📊 Analysis' },
    { id: 'recommendations', label: '💡 Recommendations' },
    { id: 'alerts', label: '🚨 Alerts' },
  ];

  return (
    <div className="glass-card p-6">
    <div className="mb-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
    <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 p-3 text-white shadow-lg">
      <Sparkles size={22} />
     </div>

    <div>
      <h2 className="text-xl font-bold">AI Financial Insights</h2>
      <p className="text-sm text-gray-500">
        Personalized recommendations powered by AI
      </p>
     </div>
    </div>

    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
  >
      <RefreshCw size={16} />
      {isLoading ? "Thinking..." : "Refresh"}
      </button>
       </div>
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white shadow-lg">
    <div className="flex items-center justify-between">
    <div>
        <p className="text-sm opacity-90">
         Financial Health Score
        </p>

       <h1 className="mt-2 text-4xl font-bold">
          87/100
         </h1>

        <p className="mt-2 text-sm">
          Excellent financial condition
         </p>
        </div>

        <Activity size={50}/>
       </div>
       </div>
      <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      )}

      {!isLoading && tab === 'analysis' && (
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {spendingAnalysis?.content || 'No analysis yet. Click Refresh to generate one from your recent transactions.'}
        </p>
      )}

      {!isLoading && tab === 'recommendations' && (
        <div className="space-y-3">
          {recommendations.length === 0 && (
            <p className="text-sm text-gray-500">No recommendations yet. Click Refresh to generate some.</p>
          )}
          {recommendations.map((rec, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-xl dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{rec.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    rec.priority === 'high'
                      ? 'bg-red-50 text-danger-600 dark:bg-red-500/10'
                      : rec.priority === 'medium'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                      : 'bg-emerald-50 text-success-600 dark:bg-emerald-500/10'
                  }`}
                >
                  {rec.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{rec.detail}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && tab === 'alerts' && (
        <div>
          {overspendingAlerts.breaches.length === 0 ? (
            <p className="text-sm text-gray-500">
              {overspendingAlerts.message || 'No overspending detected. Click Refresh to check your budgets.'}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-danger-600">
                {overspendingAlerts.message}
              </p>
              <div className="space-y-2">
                {overspendingAlerts.breaches.map((b) => (
                  <div key={b.category} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{b.category}</span>
                    <span className="text-gray-500">
                      {b.percentUsed}% used ({b.spent} / {b.limit})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsightsCard;
