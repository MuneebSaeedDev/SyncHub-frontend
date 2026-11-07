import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, UserPlus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import DatePicker from '../../components/taskComponents/DatePicker.jsx';
import { createTask, fetchTasks } from '../../store/taskSlice.js';

export default function CreateTask({ isOpen = true, onClose }) {
  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const datePickerRef = useRef(null);

  // Close datepicker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 8) {
      setError('Task Title must be at least 8 characters long.');
      return;
    }
    if (description.trim().length < 16) {
      setError('Description must be at least 16 characters long.');
      return;
    }
    if (!dueDate) {
      setError('Due Date is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate,
        })
      ).unwrap();

      dispatch(fetchTasks());
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return dateVal;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleDateSelect = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    } else {
      setDueDate('');
    }
    setIsDatePickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-opacity animate-fadeIn">
      {/* Yahan overflow-hidden ki jagah overflow-visible kiya hai taake calendar cut na ho */}
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-visible flex flex-col transform transition-all relative">
        
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
            <p className="text-sm text-gray-500 mt-0.5">Add a personal task to your workspace.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 flex-1 overflow-visible">
          
          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-900">
                Task Title <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">{title.length}/100</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Enter task title..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1">Minimum 8 characters required by schema.</p>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-900">
                Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">{description.length}/1000</span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Provide context, acceptance criteria, or key steps (min 16 chars)..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1">Detailed description required by backend controller.</p>
          </div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-visible">
            
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl border border-gray-300 p-0.5 bg-white">
                {['Low', 'Medium', 'High'].map((p) => {
                  const isSelected = priority === p;
                  let textColor = 'text-gray-600';
                  if (isSelected) {
                    if (p === 'Low') textColor = 'text-gray-900';
                    if (p === 'Medium') textColor = 'text-amber-700';
                    if (p === 'High') textColor = 'text-red-600';
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? `bg-amber-50/60 border border-amber-300/60 shadow-xs ${textColor}`
                          : `text-gray-500 hover:text-gray-900 hover:bg-gray-50`
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date with Custom DatePicker Dropdown Trigger */}
            <div className="relative overflow-visible" ref={datePickerRef}>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              
              <div
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white cursor-pointer hover:border-indigo-600 transition-colors select-none"
              >
                <span className={dueDate ? 'text-gray-900' : 'text-gray-400'}>
                  {dueDate ? formatDisplayDate(dueDate) : 'YYYY-MM-DD'}
                </span>
                <CalendarIcon size={16} className="text-gray-400" />
              </div>

              {/* Absolute positioning upar ki taraf ya neat drop-down ke liye */}
              {isDatePickerOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-[9999] shadow-2xl bg-white rounded-xl border border-slate-200">
                  <DatePicker
                    value={dueDate}
                    onChange={handleDateSelect}
                  />
                </div>
              )}
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm cursor-pointer transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>

      </div>
    </div>
  );
}