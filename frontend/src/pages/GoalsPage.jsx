import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiClient';
import { useSelector, useDispatch } from 'react-redux';
import { planGoal } from '../features/ai/aiSlice';

const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);

const GOAL_TYPES = [
  { value: 'savings', label: 'Savings', icon: '💰' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: '🚨' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'laptop', label: 'Laptop / Gadget', icon: '💻' },
  { value: 'custom', label: 'Custom', icon: '🎯' },
];

const emptyForm = { title: '', type: 'savings', targetAmount: '', currentAmount: 0, deadline: '' };

const GoalsPage = () => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.auth.user?.currency) || 'USD';
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [planningGoalId, setPlanningGoalId] = useState(null);
  const [plans, setPlans] = useState({}); // { [goalId]: plan }

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/goals');
      setGoals(data.goals);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const icon = GOAL_TYPES.find((t) => t.value === formData.type)?.icon || '🎯';
      await apiClient.post('/goals', {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        icon,
      });
      toast.success('Goal created');
      setShowForm(false);
      setFormData(emptyForm);
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleContribute = async (goal) => {
    const amount = window.prompt(`Add funds to "${goal.title}" (current: ${formatCurrency(goal.currentAmount, currency)})`);
    if (!amount || isNaN(amount)) return;
    try {
      await apiClient.put(`/goals/${goal._id}`, {
        currentAmount: goal.currentAmount + parseFloat(amount),
      });
      toast.success('Contribution added!');
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update goal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await apiClient.delete(`/goals/${id}`);
      toast.success('Goal deleted');
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const handleAIPlan = async (goalId) => {
    setPlanningGoalId(goalId);
    try {
      const result = await dispatch(planGoal(goalId)).unwrap();
      setPlans((prev) => ({ ...prev, [goalId]: result.plan }));
    } catch (err) {
      toast.error(err || 'Failed to generate AI plan');
    } finally {
      setPlanningGoalId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plan and track progress toward your goals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Goal Title</label>
            <input
              type="text"
              name="title"
              required
              className="input-field"
              placeholder="e.g. New Laptop"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Goal Type</label>
            <select name="type" className="input-field" value={formData.type} onChange={handleChange}>
              {GOAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Target Amount</label>
            <input
              type="number"
              step="0.01"
              name="targetAmount"
              required
              className="input-field"
              placeholder="2000"
              value={formData.targetAmount}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Starting Amount</label>
            <input
              type="number"
              step="0.01"
              name="currentAmount"
              className="input-field"
              value={formData.currentAmount}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Deadline (optional)</label>
            <input type="date" name="deadline" className="input-field" value={formData.deadline} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary w-full">
              Create Goal
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-40 w-full" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">No goals yet. Create one to start planning.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => (
            <div key={g._id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <h3 className="font-semibold">{g.title}</h3>
                    {g.deadline && (
                      <p className="text-xs text-gray-500">
                        Due {new Date(g.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(g._id)} className="text-xs font-medium text-danger-600 hover:underline">
                  Delete
                </button>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{formatCurrency(g.currentAmount, currency)}</span>
                  <span className="text-gray-500">of {formatCurrency(g.targetAmount, currency)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{ width: `${g.progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">{g.progressPercent}% complete</p>
              </div>

              {g.isCompleted ? (
                <p className="mt-3 text-center text-sm font-semibold text-success-600">🎉 Goal Achieved!</p>
              ) : (
                <>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleContribute(g)} className="btn-secondary flex-1 !py-2 text-xs">
                      Add Contribution
                    </button>
                    <button
                      onClick={() => handleAIPlan(g._id)}
                      disabled={planningGoalId === g._id}
                      className="btn-secondary flex-1 !py-2 text-xs disabled:opacity-50"
                    >
                      {planningGoalId === g._id ? 'Thinking…' : '✨ AI Plan'}
                    </button>
                  </div>

                  {plans[g._id] && (
                    <div className="mt-3 rounded-xl border border-primary-100 dark:border-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5 p-3 text-xs space-y-2">
                      <p>
                        <span className="font-semibold">Suggested monthly contribution:</span>{' '}
                        {formatCurrency(plans[g._id].suggestedMonthlyContribution, currency)}
                      </p>
                      <p>
                        <span className="font-semibold">Estimated time to complete:</span>{' '}
                        {plans[g._id].estimatedMonthsToComplete} months
                      </p>
                      {g.deadline && (
                        <p>
                          <span className="font-semibold">Deadline realistic?</span>{' '}
                          {plans[g._id].isDeadlineRealistic ? '✅ Yes' : '⚠️ Tight — consider adjusting'}
                        </p>
                      )}
                      {plans[g._id].tips?.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                          {plans[g._id].tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
