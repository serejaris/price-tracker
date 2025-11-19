import React, { useState, useEffect } from 'react';

import { Plus, Trash2, Edit2, Calendar, CreditCard, TrendingUp, AlertCircle, X, Check } from 'lucide-react';

// --- Utility Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateNextPayment = (startDate, cycle) => {
  const start = new Date(startDate);
  const today = new Date();
  let next = new Date(start);
  while (next <= today) {
    if (cycle === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setFullYear(next.getFullYear() + 1);
    }
  }
  return next;
};

const getDaysUntil = (date) => {
  const today = new Date();
  const target = new Date(date);
  const diffTime = Math.abs(target - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const COLORS = [
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Green', class: 'bg-emerald-500' },
  { name: 'Red', class: 'bg-rose-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Gray', class: 'bg-gray-600' },
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scaleIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, type = "text", value, onChange, required = false, placeholder = "" }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
      </div>
    </div>
  </div>
);

// --- Main Application ---

export default function App() {
  // Initial state from localStorage or empty
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('subscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: '₽',
    cycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    color: 'bg-blue-500'
  });

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Calculations
  const totalMonthly = subscriptions.reduce((acc, sub) => {
    let monthlyPrice = parseFloat(sub.price);
    if (sub.cycle === 'yearly') monthlyPrice = monthlyPrice / 12;
    return acc + monthlyPrice;
  }, 0);

  const totalYearly = totalMonthly * 12;

  // Handlers
  const handleOpenModal = (sub = null) => {
    if (sub) {
      setEditingId(sub.id);
      setFormData({
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        cycle: sub.cycle,
        startDate: sub.startDate,
        color: sub.color
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        price: '',
        currency: '₽',
        cycle: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        color: COLORS[Math.floor(Math.random() * COLORS.length)].class
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const newSub = {
      id: editingId || generateId(),
      ...formData,
      price: parseFloat(formData.price)
    };

    if (editingId) {
      setSubscriptions(subscriptions.map(s => s.id === editingId ? newSub : s));
    } else {
      setSubscriptions([...subscriptions, newSub]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту подписку?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Header & Stats */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Трекер Подписок
            </h1>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Добавить</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium mb-1">Итого в месяц</p>
                <h2 className="text-3xl font-bold">{Math.round(totalMonthly).toLocaleString()} ₽</h2>
              </div>
              <CreditCard className="absolute right-4 bottom-4 text-white/20 w-16 h-16 transform rotate-12" />
            </div>
            
            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-300 text-sm font-medium mb-1">Итого в год</p>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{Math.round(totalYearly).toLocaleString()} ₽</h2>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {subscriptions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <CreditCard size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">Нет активных подписок</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Нажмите кнопку "Добавить", чтобы начать отслеживать свои регулярные платежи.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {subscriptions.map((sub) => {
              const nextDate = calculateNextPayment(sub.startDate, sub.cycle);
              const daysLeft = getDaysUntil(nextDate);
              const isUrgent = daysLeft <= 3;

              return (
                <div 
                  key={sub.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden"
                >
                  {/* Color Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sub.color}`}></div>

                  {/* Icon / Initial */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm flex-shrink-0 ${sub.color}`}>
                    {sub.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate pr-2">{sub.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          {sub.price.toLocaleString()} {sub.currency} 
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          {sub.cycle === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 mt-2 sm:mt-0 w-full sm:w-auto">
                    <div className="text-right flex-grow sm:flex-grow-0">
                      <div className={`flex items-center justify-end gap-1.5 text-sm font-medium ${isUrgent ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                         {isUrgent && <AlertCircle size={14} />}
                         {daysLeft === 0 ? 'Сегодня!' : `Через ${daysLeft} дн.`}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(nextDate)}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(sub)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Редактировать подписку" : "Новая подписка"}
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Название сервиса"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Netflix, Spotify, Интернет..."
            required
          />
          
          <div className="flex gap-4">
            <div className="flex-grow">
              <InputField
                label="Стоимость"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div className="w-24">
               <SelectField
                label="Валюта"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={[
                  { value: '₽', label: '₽' },
                  { value: '$', label: '$' },
                  { value: '€', label: '€' },
                  { value: '₸', label: '₸' },
                ]}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <SelectField
                label="Период списания"
                value={formData.cycle}
                onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                options={[
                  { value: 'monthly', label: 'Ежемесячно' },
                  { value: 'yearly', label: 'Ежегодно' },
                ]}
              />
            </div>
            <div className="w-1/2">
              <InputField
                label="Первый платеж"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Цвет карточки
            </label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.class })}
                  className={`w-8 h-8 rounded-full ${c.class} transition-transform hover:scale-110 ${
                    formData.color === c.class ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <Check size={20} />
            Сохранить
          </button>
        </form>
      </Modal>
    </div>
  );
}

