import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Calendar as CalendarIcon, Loader2, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 backdrop-blur-xs p-4 transition-opacity animate-fadeIn">
      <div className="w-full max-w-xl rounded-[12px] bg-white shadow-xl border border-[#dddddd] flex flex-col relative overflow-visible text-[#181d26]">

        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-[#dddddd]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="!text-base font-semibold text-[#181d26] tracking-tight">
                Edit Task
              </h2>
              <span className="rounded-[4px] bg-[#f8fafc] border border-[#dddddd] px-1.5 py-0.5 text-[11px] font-mono text-[#41454d]">
                {shortId}
              </span>
            </div>
            <p className="!text-xs text-[#41454d] mt-0.5">
              Update the details of your personal task.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="cursor-pointer rounded-[6px] p-1.5 text-[#41454d] hover:bg-[#f8fafc] hover:text-[#181d26] transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">

          {/* Error Banner */}
          {error && (
            <div className="rounded-[6px] bg-[#aa2d00]/10 p-3 !text-xs text-[#aa2d00] border border-[#aa2d00]/30">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block !text-xs font-medium text-[#181d26]">
                Task Title <span className="text-[#aa2d00]">*</span>
              </label>
              <span className="text-[11px] text-[#9297a0] tabular-nums">
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Enter task title..."
              className="w-full rounded-[6px] border border-[#dddddd] bg-white px-3 py-2 !text-xs text-[#181d26] placeholder:text-[#9297a0] hover:border-[#9297a0] focus:border-[#458fff] focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block !text-xs font-medium text-[#181d26]">
                Description <span className="text-[#aa2d00]">*</span>
              </label>
              <span className="text-[11px] text-[#9297a0] tabular-nums">
                {description.length}/1000
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Provide context, acceptance criteria, or key steps..."
              className="w-full rounded-[6px] border border-[#dddddd] bg-white px-3 py-2 !text-xs text-[#181d26] placeholder:text-[#9297a0] hover:border-[#9297a0] focus:border-[#458fff] focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">

            {/* Priority */}
            <div>
              <label className="block !text-xs font-medium text-[#181d26] mb-1.5">
                Priority <span className="text-[#aa2d00]">*</span>
              </label>
              <div className="flex rounded-[8px] border border-[#dddddd] p-0.5 bg-[#f8fafc] h-[36px] items-center">
                {['low', 'medium', 'high'].map((p) => {
                  const isSelected = priority === p;
                  const label = p.charAt(0).toUpperCase() + p.slice(1);

                  let activeStyles = '!text-xs border-transparent text-[#41454d] hover:text-[#181d26] hover:bg-white/60';

                  if (isSelected) {
                    if (p === 'high') {
                      activeStyles = '!text-xs border border-[#aa2d00]/30 bg-white text-[#aa2d00] font-medium shadow-xs';
                    } else if (p === 'medium') {
                      activeStyles = '!text-xs border border-[#d9a441]/40 bg-white text-[#91650c] font-medium shadow-xs';
                    } else {
                      activeStyles = '!text-xs border border-[#dddddd] bg-white text-[#181d26] font-medium shadow-xs';
                    }
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 h-full rounded-[6px] !text-xs font-medium cursor-pointer transition-colors flex items-center justify-center capitalize ${activeStyles}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <div className="relative" ref={datePickerRef}>
              <label className="block !text-xs font-medium text-[#181d26] mb-1.5">
                Due Date <span className="text-[#aa2d00]">*</span>
              </label>

              <div
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-[6px] border border-[#dddddd] px-3 py-2 !text-xs text-[#181d26] bg-white cursor-pointer hover:border-[#9297a0] transition-colors select-none h-[36px]"
              >
                <span className={dueDate ? 'text-[#181d26]' : 'text-[#9297a0]'}>
                  {dueDate || 'YYYY-MM-DD'}
                </span>
                <CalendarIcon size={14} className="text-[#41454d] shrink-0" />
              </div>

              {/* DatePicker Dropdown */}
              {isDatePickerOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-50 shadow-xl">
                  <DatePicker
                    value={dueDate}
                    onChange={handleDateSelect}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Metadata Row: Created on & Last updated */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#41454d]">
            <CalendarIcon size={12} className="text-[#9297a0] shrink-0" />
            <span>
              Created on {createdDateStr} &middot; Last updated {updatedDateStr}
            </span>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#f8fafc] border-t border-[#dddddd] rounded-b-[12px]">
          {/* Delete Action on the left */}
          <button
            type="button"
            onClick={handleDelete}
            className="cursor-pointer !text-xs font-medium text-[#aa2d00] hover:text-[#8f2500] hover:bg-[#aa2d00]/10 px-2.5 py-1.5 rounded-[6px] transition-colors"
          >
            Delete task...
          </button>

          {/* Cancel and Save on the right */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 !text-xs font-medium text-[#181d26] hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUpdating}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#181d26] hover:bg-[#0d1218] active:bg-[#0d1218] px-4 py-2 !text-xs font-medium text-white transition-all disabled:opacity-50 shadow-xs"
            >
              {isUpdating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
