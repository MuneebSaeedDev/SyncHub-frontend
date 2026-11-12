import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import DatePicker from "../../components/taskComponents/DatePicker.jsx";
import { createTask } from "../../store/taskSlice.js";

export default function CreateTask({ isOpen = true, onClose }) {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const datePickerRef = useRef(null);

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setError("");
    setIsDatePickerOpen(false);
  };

  // Reset when dialog closes or unmounts
  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  // Close datepicker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (title.trim().length < 8) {
      setError("Task Title must be at least 8 characters long.");
      return;
    }
    if (description.trim().length < 16) {
      setError("Description must be at least 16 characters long.");
      return;
    }
    if (!dueDate) {
      setError("Due Date is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        createTask({
          title: title.trim(),
          description: description.trim(),
          priority: priority.toLowerCase(),
          dueDate,
        }),
      ).unwrap();

      // Reset form values upon successful creation
      resetForm();

      onClose?.();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to create task. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return "";
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return dateVal;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleDateSelect = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setDueDate(`${year}-${month}-${day}`);
    } else {
      setDueDate("");
    }
    setIsDatePickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 backdrop-blur-xs p-4 transition-opacity animate-fadeIn">
      <div className="w-full max-w-xl rounded-[12px] bg-white shadow-xl border border-[#dddddd] flex flex-col transform transition-all overflow-visible relative text-[#181d26]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-[#dddddd]">
          <div>
            <h2 className="!text-base font-semibold tracking-tight text-[#181d26]">
              Create New Task
            </h2>
            <p className="!text-xs text-[#41454d] mt-0.5">
              Add a personal task to your workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-[6px] p-1.5 text-[#41454d] hover:bg-[#f8fafc] hover:text-[#181d26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 flex-1">
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
            <p className="text-[11px] text-[#41454d] mt-1">
              Minimum 8 characters required by schema.
            </p>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-[#181d26]">
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
              placeholder="Provide context, acceptance criteria, or key steps (min 16 chars)..."
              className="w-full rounded-[6px] border border-[#dddddd] bg-white px-3 py-2 !text-xs text-[#181d26] placeholder:text-[#9297a0] hover:border-[#9297a0] focus:border-[#458fff] focus:outline-none resize-none transition-colors"
            />
            <p className="text-[11px] text-[#41454d] mt-1">
              Detailed description required by backend controller.
            </p>
          </div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block !text-xs font-medium text-[#181d26] mb-1.5">
                Priority <span className="text-[#aa2d00]">*</span>
              </label>
              <div className="flex rounded-[8px] border border-[#dddddd] p-0.5 bg-[#f8fafc]">
                {["low", "medium", "high"].map((p) => {
                  const isSelected = priority.toLowerCase() === p;
                  let selectedStyle =
                    "bg-white text-[#181d26] border border-[#dddddd] shadow-xs";

                  if (isSelected) {
                    if (p === "low")
                      selectedStyle =
                        "bg-white text-[#181d26] border border-[#dddddd] shadow-xs";
                    if (p === "medium")
                      selectedStyle =
                        "bg-white text-[#91650c] border border-[#d9a441]/50 shadow-xs";
                    if (p === "high")
                      selectedStyle =
                        "bg-white text-[#aa2d00] border border-[#aa2d00]/40 shadow-xs";
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-[6px] py-1.5 !text-xs font-medium cursor-pointer transition-colors capitalize ${
                        isSelected
                          ? selectedStyle
                          : `text-[#41454d] hover:text-[#181d26] hover:bg-white/60 border border-transparent`
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date with Custom DatePicker Dropdown Trigger */}
            <div className="relative" ref={datePickerRef}>
              <label className="block !text-xs font-medium text-[#181d26] mb-1.5">
                Due Date <span className="text-[#aa2d00]">*</span>
              </label>

              <div
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-[6px] border border-[#dddddd] px-3 py-2 !text-xs bg-white cursor-pointer hover:border-[#9297a0] transition-colors select-none"
              >
                <span className={dueDate ? "text-[#181d26]" : "text-[#9297a0]"}>
                  {dueDate ? formatDisplayDate(dueDate) : "YYYY-MM-DD"}
                </span>
                <CalendarIcon size={14} className="text-[#41454d]" />
              </div>

              {/* DatePicker UI pops up above the input to avoid modal cutoff */}
              {isDatePickerOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-50 shadow-xl">
                  <DatePicker value={dueDate} onChange={handleDateSelect} />
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#f8fafc] border-t border-[#dddddd] rounded-b-[12px]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 !text-xs font-medium text-[#181d26] hover:bg-[#f8fafc] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#181d26] px-4 py-2 !text-xs font-medium text-white hover:bg-[#0d1218] active:bg-[#0d1218] cursor-pointer transition-all disabled:opacity-50 shadow-xs"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
