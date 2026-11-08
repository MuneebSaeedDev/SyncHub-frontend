import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Calendar as CalendarIcon, Loader2, UserCheck } from 'lucide-react';
import DatePicker from '../../components/taskComponents/DatePicker.jsx';
import { updateTask } from '../../store/taskSlice.js';

export default function EditTask({
  isOpen = false,
  task = null,
  onClose,
  onTaskUpdated,
  onDeleteTask,
  onDelete,
}) {
  const dispatch = useDispatch();
  const { isUpdating } = useSelector((state) => state.tasks);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');
  const [dueDate, setDueDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [error, setError] = useState('');

  const datePickerRef = useRef(null);

  // Sync state when task prop changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority ? task.priority.toLowerCase() : 'high');

      if (task.dueDate) {
        const d = new Date(task.dueDate);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          setDueDate(`${year}-${month}-${day}`);
        } else {
          setDueDate(task.dueDate);
        }
      } else {
        setDueDate('');
      }
      setError('');
      setIsDatePickerOpen(false);
    }
  }, [task]);

  // Close DatePicker when clicking outside
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

  if (!isOpen || !task) return null;

  // Format short ID like #task-8f92
  const taskId = task._id;
  const shortId = taskId ? `#task-${taskId.slice(4)}` : '#task-8f92';

  // Format created & updated dates
  const formatMetadataDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const createdDateStr = formatMetadataDate(task.createdAt);
  const updatedDateStr = formatMetadataDate(task.updatedAt);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
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
      await dispatch(
        updateTask({
          id: taskId,
          title: title.trim(),
          description: description.trim(),
          priority: priority.toLowerCase(),
          dueDate,
        })
      ).unwrap();

      onClose?.();
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to update task.');
    }
  };

  const handleDelete = () => {
    onDelete?.(task);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 transition-opacity">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col relative overflow-visible">

        {/* Modal Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-2 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Edit Task
              </h2>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 font-mono">
                {shortId}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Update the details of your personal task.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-7 py-4 space-y-4">

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-900">
                Task Title <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400 font-normal">
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Finalize Quarterly Engineering Sprint Scope"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-900">
                Description <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400 font-normal">
                {description.length}/1000
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Define epic deliverables, milestones, and resource allocation across team members."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none transition-colors shadow-2xs"
            />
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl border border-slate-300 p-1 bg-white h-[42px] items-center">
                {['low', 'medium', 'high'].map((p) => {
                  const isSelected = priority === p;
                  const label = p.charAt(0).toUpperCase() + p.slice(1);

                  let activeStyles = 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50';

                  if (isSelected) {
                    if (p === 'high') {
                      activeStyles = 'border border-red-500/80 bg-red-50/50 text-red-600 font-semibold shadow-2xs';
                    } else if (p === 'medium') {
                      activeStyles = 'border border-amber-500/80 bg-amber-50/50 text-amber-700 font-semibold shadow-2xs';
                    } else {
                      activeStyles = 'border border-slate-400 bg-slate-100 text-slate-900 font-semibold shadow-2xs';
                    }
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 h-full rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center justify-center ${activeStyles}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <div className="relative" ref={datePickerRef}>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 bg-white cursor-pointer hover:border-indigo-600 transition-colors select-none shadow-2xs h-[42px]"
              >
                <span className={dueDate ? 'text-slate-900 font-normal' : 'text-slate-400'}>
                  {dueDate || 'YYYY-MM-DD'}
                </span>
                <CalendarIcon size={16} className="text-slate-400 shrink-0" />
              </div>

              {/* DatePicker Dropdown */}
              {isDatePickerOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-50">
                  <DatePicker
                    value={dueDate}
                    onChange={handleDateSelect}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Metadata Row: Created on & Last updated */}
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
            <CalendarIcon size={14} className="text-slate-400 shrink-0" />
            <span>
              Created on {createdDateStr} • Last updated {updatedDateStr}
            </span>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-7 py-5 bg-white border-t border-slate-100 rounded-b-2xl mt-2">
          {/* Delete Action on the left */}
          <button
            type="button"
            onClick={handleDelete}
            className="cursor-pointer text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
          >
            Delete task...
          </button>

          {/* Cancel and Save on the right */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="cursor-pointer rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUpdating}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {isUpdating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserCheck size={16} />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
