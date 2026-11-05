import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, deleteTask } from '../../store/taskSlice';
import DatePicker from '../../components/taskComponents/DatePicker';
import DeleteTaskModal from '../../components/taskComponents/DeleteTaskModal';
import TaskDropdown from '../../components/taskComponents/TaskDropdown';
import {
    Search,
    SlidersHorizontal,
    Plus,
    MoreHorizontal,
    Loader2,
    Calendar as CalendarIcon
} from 'lucide-react';

export default function TaskPage() {
    const dispatch = useDispatch();
    const { tasks, isLoading, isDeleting, error } = useSelector((state) => state.tasks);

    const [activeTab, setActiveTab] = useState('All Tasks');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 6;

    // Filter states
    const [selectedDateFilter, setSelectedDateFilter] = useState(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Inline Task Row Date Picker state (kis task ki due date edit ho rahi hai)
    const [activeDateTaskId, setActiveDateTaskId] = useState(null);

    // Modal & Dropdown states
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const dropdownRef = useRef(null);
    const datePickerRef = useRef(null);
    const inlineDatePickerRef = useRef(null);

    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    // Close popups on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdownId(null);
            }
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
            if (inlineDatePickerRef.current && !inlineDatePickerRef.current.contains(event.target)) {
                setActiveDateTaskId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tabs = ['All Tasks', 'High Priority', 'Medium Priority', 'Low Priority'];

    // Date formatting helper
    const formatDate = (date) => {
        if (!date) return 'No date';
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return date;
        return parsedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const getPriorityBadge = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-50 text-red-700 border border-red-200/60';
            case 'medium':
                return 'bg-amber-50 text-amber-700 border border-amber-200/60';
            case 'low':
                return 'bg-slate-100 text-slate-700 border border-slate-200/60';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityDot = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-amber-500';
            case 'low':
                return 'bg-slate-400';
            default:
                return 'bg-slate-400';
        }
    };

    // Filter tasks based on tabs, search, and date picker
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTab = true;
        if (activeTab === 'High Priority') matchesTab = task.priority?.toLowerCase() === 'high';
        if (activeTab === 'Medium Priority') matchesTab = task.priority?.toLowerCase() === 'medium';
        if (activeTab === 'Low Priority') matchesTab = task.priority?.toLowerCase() === 'low';

        let matchesDate = true;
        if (selectedDateFilter && task.dueDate) {
            const taskDate = new Date(task.dueDate);
            matchesDate =
                taskDate.getFullYear() === selectedDateFilter.getFullYear() &&
                taskDate.getMonth() === selectedDateFilter.getMonth() &&
                taskDate.getDate() === selectedDateFilter.getDate();
        }

        return matchesSearch && matchesTab && matchesDate;
    });

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage) || 1;

    const handleConfirmDelete = () => {
        if (!taskToDelete) return;
        dispatch(deleteTask(taskToDelete._id)).then(() => {
            setTaskToDelete(null);
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{tasks.length} active personal tasks recorded</p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-500"
                    >
                        <Plus size={16} />
                        Create Task
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`py-3 px-1 !text-sm font-medium border-b-2 transition-colors relative cursor-pointer ${isActive
                                            ? 'border-[#6366F1] text-[#6366F1]'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Filter by title..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all shadow-xs"
                        />
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto relative">
                        <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
                            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                            Filters
                        </button>

                        {/* Top DatePicker Filter Trigger */}
                        <div className="relative" ref={datePickerRef}>
                            <button
                                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer ${selectedDateFilter
                                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <CalendarIcon className="w-4 h-4 text-slate-500" />
                                {selectedDateFilter ? formatDate(selectedDateFilter) : 'Due date'}
                            </button>

                            {isDatePickerOpen && (
                                <div className="absolute right-0 mt-2 z-50 shadow-2xl">
                                    <DatePicker
                                        value={selectedDateFilter}
                                        onChange={(date) => {
                                            setSelectedDateFilter(date);
                                            setIsDatePickerOpen(false);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Task Table Container */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                    <th className="py-3 px-6 w-32">State</th>
                                    <th className="py-3 px-2">Task Title & Description</th>
                                    <th className="py-3 px-6 w-32">Priority</th>
                                    <th className="py-3 px-6 w-36">Due Date</th>
                                    <th className="py-3 px-6 w-24 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
                                                Loading tasks...
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500">
                                            No tasks found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentTasks.map((task) => {
                                        const taskId = task._id;
                                        const isMenuOpen = activeDropdownId === taskId;
                                        const isInlineDateOpen = activeDateTaskId === taskId;
                                        const formattedDueDate = formatDate(task.dueDate);

                                        return (
                                            <tr key={taskId} className="hover:bg-slate-50/60 transition-colors group cursor-pointer">
                                                {/* Status Column */}
                                                <td className="py-4 px-6 align-middle">
                                                    <span className={`text-xs font-medium ${task.status === 'Overdue' ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                                                        {task.status || 'Default'}
                                                    </span>
                                                </td>

                                                {/* Title & Description Column */}
                                                <td className="py-4 px-2 align-middle">
                                                    <div className="space-y-0.5">
                                                        <p className="font-semibold text-slate-900">{task.title}</p>
                                                        <p className="text-xs text-slate-500">{task.description}</p>
                                                    </div>
                                                </td>

                                                {/* Priority Column */}
                                                <td className="py-4 px-6 align-middle">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(task.priority)}`}></span>
                                                        {task.priority}
                                                    </span>
                                                </td>

                                                {/* Due Date Column with Toggleable DatePicker */}
                                                <td className="py-4 px-6 align-middle text-xs relative">
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDateTaskId(isInlineDateOpen ? null : taskId);
                                                        }}
                                                        className="cursor-pointer inline-block hover:text-indigo-600 transition-colors"
                                                    >
                                                        {task.isOverdue ? (
                                                            <span className="text-rose-600 font-medium leading-tight block">
                                                                {formattedDueDate} <span className="block text-[11px]">· Overdue</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-600">{formattedDueDate}</span>
                                                        )}
                                                    </div>

                                                    {/* DatePicker renders right on click, overriding/overlapping container bounds */}
                                                    {isInlineDateOpen && (
                                                        <div
                                                            ref={inlineDatePickerRef}
                                                            className="absolute left-0 top-14 z-50 shadow-2xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <DatePicker
                                                                value={task.dueDate}
                                                                onChange={(newDate) => {
                                                                    // Yahan aap date update action dispatch kar sakte hain agar zaroorat ho
                                                                    console.log("Selected new date for task:", taskId, newDate);
                                                                    setActiveDateTaskId(null);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions Column with Dropdown */}
                                                <td className="py-4 px-6 align-middle text-right relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdownId(isMenuOpen ? null : taskId);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                                        title="Actions"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>

                                                    {isMenuOpen && (
                                                        <div
                                                            ref={dropdownRef}
                                                            className="absolute right-12 top-2 z-50 text-left shadow-2xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <TaskDropdown
                                                                onEdit={() => {
                                                                    alert(`Edit task: ${task.title}`);
                                                                    setActiveDropdownId(null);
                                                                }}
                                                                onView={() => {
                                                                    alert(`View task: ${task.title}`);
                                                                    setActiveDropdownId(null);
                                                                }}
                                                                onDelete={() => {
                                                                    setActiveDropdownId(null);
                                                                    setTaskToDelete(task);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-white gap-3">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-medium text-slate-700">{filteredTasks.length > 0 ? indexOfFirstTask + 1 : 0}–{Math.min(indexOfLastTask, filteredTasks.length)}</span> of <span className="font-medium text-slate-700">{filteredTasks.length}</span> tasks
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors cursor-pointer ${currentPage === page
                                            ? 'bg-[#6366F1] text-white shadow-xs'
                                            : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Integrated Delete Confirmation Modal */}
            <DeleteTaskModal
                isOpen={Boolean(taskToDelete)}
                task={taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}