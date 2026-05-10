import { useEffect, useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { tripsApi } from '../../lib/api';
import { useResolvedTrip } from '../../hooks/useResolvedTrip';
import { formatCurrency, formatDateRange } from '../../lib/formatters';

const colors = ['#6366f1', '#a855f7', '#3b82f6', '#06b6d4', '#0f172a'];

export default function BudgetBreakdownPage() {
  const { tripId, trip } = useResolvedTrip();
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    category: 'activities',
    label: '',
    amount: '',
    expenseDate: '',
    stopId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBudget = async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [summaryResponse, expensesResponse] = await Promise.all([
        tripsApi.budgetSummary(tripId),
        tripsApi.expenses(tripId)
      ]);

      setSummary(summaryResponse.data);
      setExpenses(expensesResponse.data || []);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load budget.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    setError('');
    loadBudget().catch(() => {});
    return () => {
      ignore = true;
    };
  }, [tripId]);

  const chartData = summary
    ? Object.entries(summary.categories).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
    : [];

  const dailySpending = expenses.map((expense) => ({
    day: new Date(expense.expenseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: Number(expense.amount)
  }));

  const addExpense = async () => {
    if (!tripId || !expenseForm.amount || !expenseForm.expenseDate) {
      setError('Expense amount and date are required.');
      return;
    }

    try {
      setError('');
      await tripsApi.createExpense(tripId, {
        stopId: expenseForm.stopId || undefined,
        category: expenseForm.category,
        label: expenseForm.label || undefined,
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        notes: expenseForm.notes || undefined
      });
      setExpenseForm({
        category: 'activities',
        label: '',
        amount: '',
        expenseDate: '',
        stopId: '',
        notes: ''
      });
      await loadBudget();
    } catch (requestError) {
      setError(requestError.message || 'Failed to create expense.');
    }
  };

  const removeExpense = async (expenseId) => {
    try {
      await tripsApi.deleteExpense(tripId, expenseId);
      await loadBudget();
    } catch (requestError) {
      setError(requestError.message || 'Failed to delete expense.');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-navy tracking-tighter uppercase">Budget Allocation</h2>
          <p className="text-brand-slate font-bold uppercase tracking-widest text-sm mt-1">{trip?.name || 'Trip Financial Breakdown'}</p>
        </div>
      </div>

      {loading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading budget...</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}

      {trip ? (
        <GlassCard className="p-8 bg-white border-brand-navy/10 group">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-64 space-y-2">
              <h3 className="text-2xl font-black text-brand-navy uppercase tracking-tight">{trip.name}</h3>
              <div className="flex items-center gap-2 text-brand-slate">
                <Calendar size={16} />
                <span className="text-sm font-bold">{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mb-1">Target Budget</p>
                <p className="text-2xl font-black text-brand-navy">{formatCurrency(summary?.budgetLimit || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest mb-1">Spent So Far</p>
                <p className="text-2xl font-black text-brand-indigo">{formatCurrency(summary?.totalSpent || 0)}</p>
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center">
                <div className="w-full h-3 bg-brand-navy/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-indigo" style={{ width: `${Math.min(((summary?.totalSpent || 0) / Math.max(summary?.budgetLimit || 1, 1)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            <AnimatedButton variant="ghost" className="p-3 min-w-0">
              <ChevronRight size={24} />
            </AnimatedButton>
          </div>
        </GlassCard>
      ) : null}

      {trip ? (
        <GlassCard className="p-8 bg-white border-brand-navy/10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">Add Expense</h3>
            <p className="text-sm text-brand-slate font-medium">Track transport, stay, meals, activities, and other costs live.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={expenseForm.category} onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value }))} className="bg-white border-2 border-brand-navy/5 rounded-2xl py-4 px-4 text-brand-navy font-bold focus:outline-none">
              <option value="transport">Transport</option>
              <option value="accommodation">Accommodation</option>
              <option value="activities">Activities</option>
              <option value="meals">Meals</option>
              <option value="other">Other</option>
            </select>
            <input value={expenseForm.label} onChange={(event) => setExpenseForm((current) => ({ ...current, label: event.target.value }))} placeholder="Expense label" className="bg-white border-2 border-brand-navy/5 rounded-2xl py-4 px-4 text-brand-navy font-bold focus:outline-none" />
            <input type="number" min="0" value={expenseForm.amount} onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" className="bg-white border-2 border-brand-navy/5 rounded-2xl py-4 px-4 text-brand-navy font-bold focus:outline-none" />
            <input type="date" value={expenseForm.expenseDate} onChange={(event) => setExpenseForm((current) => ({ ...current, expenseDate: event.target.value }))} className="bg-white border-2 border-brand-navy/5 rounded-2xl py-4 px-4 text-brand-navy font-bold focus:outline-none" />
            <select value={expenseForm.stopId} onChange={(event) => setExpenseForm((current) => ({ ...current, stopId: event.target.value }))} className="bg-white border-2 border-brand-navy/5 rounded-2xl py-4 px-4 text-brand-navy font-bold focus:outline-none">
              <option value="">Entire Trip</option>
              {(trip.stops || []).map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.city?.name}
                </option>
              ))}
            </select>
            <AnimatedButton onClick={addExpense} className="rounded-2xl py-4">
              Save Expense
            </AnimatedButton>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-8 bg-white border-brand-navy/10">
          <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest mb-6">Category Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={110}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-8 bg-white border-brand-navy/10">
          <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest mb-6">Daily Spending</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpending}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-10 border-brand-indigo/30 bg-brand-indigo/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Budget</p>
            <p className="text-4xl font-black text-brand-navy">{formatCurrency(summary?.budgetLimit || 0)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Spent</p>
            <p className="text-4xl font-black text-brand-indigo">{formatCurrency(summary?.totalSpent || 0)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Remaining</p>
            <p className="text-4xl font-black text-brand-cyan">{formatCurrency(summary?.remaining || 0)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Avg / Day</p>
            <p className="text-4xl font-black text-brand-navy">{formatCurrency(summary?.averageCostPerDay || 0)}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-8 bg-white border-brand-navy/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">Expense Log</h3>
          <p className="text-xs font-black uppercase tracking-widest text-brand-slate">{expenses.length} items</p>
        </div>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-brand-navy/5 p-4">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-brand-navy">{expense.label || expense.category}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-slate">
                  {expense.category} • {new Date(expense.expenseDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-black text-brand-indigo">{formatCurrency(expense.amount)}</p>
                <button onClick={() => removeExpense(expense.id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!expenses.length ? <p className="text-sm font-bold text-brand-slate">No expenses added yet.</p> : null}
        </div>
      </GlassCard>
    </div>
  );
}
