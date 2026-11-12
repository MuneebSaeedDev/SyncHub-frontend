import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks, deleteTask } from '../../store/taskSlice';
import DatePicker from '../../components/taskComponents/DatePicker';
import DeleteTaskModal from '../../components/taskComponents/DeleteTaskModal';
import TaskDropdown from '../../components/taskComponents/TaskDropdown';
import CreateTask from './CreateTask';
import EditTask from './EditTask';
import ShareTaskModal from '../../components/sharedTaskComponents/ShareTaskModal';
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

    // Inline Task Row Date Picker state
    const [activeDateTaskId, setActiveDateTaskId] = useState(null);

    // Modal & Dropdown states
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskToShare, setTaskToShare] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const navigate = useNavigate();
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
                return 'bg-[#aa2d00]/10 text-[#aa2d00] border border-[#aa2d00]/25';
            case 'medium':
                return 'bg-[#d9a441]/15 text-[#91650c] border border-[#d9a441]/35';
            case 'low':
                return 'bg-[#f8fafc] text-[#41454d] border border-[#dddddd]';
            default:
                return 'bg-[#f8fafc] text-[#41454d] border border-[#dddddd]';
        }
    };

    const getPriorityDot = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-[#aa2d00]';
            case 'medium':
                return 'bg-[#d9a441]';
            case 'low':
                return 'bg-[#9297a0]';
            default:
                return 'bg-[#9297a0]';
        }
    };

    // Filter tasks based on tabs, search, and date picker
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
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
    }, [tasks, searchQuery, activeTab, selectedDateFilter]);

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
        <div className="min-h-screen text-[#181d26] font-sans relative">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="!text-xl font-semibold tracking-tight text-[#181d26]">My Tasks</h1>
                        <p className="!text-xs text-[#41454d] mt-1">{tasks.length} active personal tasks recorded</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreateTaskOpen(true)}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-[#181d26] px-4 py-2 !text-xs font-medium text-white transition hover:bg-[#0d1218] active:bg-[#0d1218] shadow-xs"
                    >
                        <Plus size={15} />
                        Create Task
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-[#dddddd]">
                    <nav className="flex space-x-6" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`py-2.5 px-0.5 !text-xs font-medium border-b-2 transition-colors relative cursor-pointer ${isActive
                                            ? 'border-[#181d26] text-[#181d26]'
                                            : 'border-transparent text-[#41454d] hover:text-[#181d26]'
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9297a0]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Filter by title..."
                            className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#dddddd] rounded-[8px] !text-xs text-[#181d26] placeholder:text-[#9297a0] focus:outline-none focus:border-[#458fff] transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto relative">
                        <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white border border-[#dddddd] rounded-[8px] !text-xs font-medium text-[#41454d] hover:text-[#181d26] hover:bg-[#f8fafc] transition-colors cursor-pointer">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[#41454d]" />
                            Filters
                        </button>

                        {/* Top DatePicker Filter Trigger */}
                        <div className="relative" ref={datePickerRef}>
                            <button
                                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[8px] !text-xs font-medium transition-colors cursor-pointer ${selectedDateFilter
                                        ? 'border border-[#181d26] text-[#181d26] bg-[#f8fafc]'
                                        : 'border border-[#dddddd] bg-white text-[#41454d] hover:text-[#181d26] hover:bg-[#f8fafc]'
                                    }`}
                            >
                                <CalendarIcon className="w-3.5 h-3.5 text-[#41454d]" />
                                {selectedDateFilter ? formatDate(selectedDateFilter) : 'Due date'}
                            </button>

                            {isDatePickerOpen && (
                                <div className="absolute right-0 mt-2 z-50 shadow-xl">
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
                    <div className="p-3 bg-[#aa2d00]/10 border border-[#aa2d00]/30 rounded-[8px] !text-xs text-[#aa2d00]">
                        {error}
                    </div>
                )}

                {/* Task Table Container */}
                <div className="bg-white border border-[#dddddd] rounded-[12px] shadow-xs overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#dddddd] bg-[#f8fafc] text-[11px] font-medium text-[#41454d]">
                                    <th className="py-2.5 px-5 w-28">State</th>
                                    <th className="py-2.5 px-3">Task title & description</th>
                                    <th className="py-2.5 px-5 w-32">Priority</th>
                                    <th className="py-2.5 px-5 w-36">Due date</th>
                                    <th className="py-2.5 px-5 w-20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dddddd] !text-xs">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-[#41454d]">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-[#181d26]" />
                                                Loading tasks...
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-[#41454d]">
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
                                            <tr key={taskId} className="hover:bg-[#f8fafc]/70 transition-colors group cursor-pointer">
                                                {/* Status Column */}
                                                <td className="py-3.5 px-5 align-middle">
                                                    <span className={`text-[11px] font-medium ${task.status === 'Overdue' ? 'text-[#aa2d00]' : 'text-[#41454d]'}`}>
                                                        {task.status || 'Default'}
                                                    </span>
                                                </td>

                                                {/* Title & Description Column */}
                                                <td className="py-3.5 px-3 align-middle">
                                                    <div className="space-y-0.5">
                                                        <p className="font-medium text-[#181d26]">{task.title}</p>
                                                        <p className="text-[11px] text-[#41454d]">{task.description}</p>
                                                    </div>
                                                </td>

                                                {/* Priority Column */}
                                                <td className="py-3.5 px-5 align-middle">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${getPriorityBadge(task.priority)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(task.priority)}`}></span>
                                                        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Low'}
                                                    </span>
                                                </td>

                                                {/* Due Date Column with Toggleable DatePicker */}
                                                <td className="py-3.5 px-5 align-middle text-[11px] relative">
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDateTaskId(isInlineDateOpen ? null : taskId);
                                                        }}
                                                        className="cursor-pointer inline-block hover:text-[#181d26] text-[#41454d] transition-colors"
                                                    >
                                                        {task.isOverdue ? (
                                                            <span className="text-[#aa2d00] font-medium leading-tight block">
                                                                {formattedDueDate} <span className="block text-[10px] text-[#aa2d00]/80">&middot; Overdue</span>
                                                            </span>
                                                        ) : (
                                                            <span>{formattedDueDate}</span>
                                                        )}
                                                    </div>

                                                    {/* DatePicker */}
                                                    {isInlineDateOpen && (
                                                        <div
                                                            ref={inlineDatePickerRef}
                                                            className="absolute left-0 top-12 z-50 shadow-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <DatePicker
                                                                value={task.dueDate}
                                                                onChange={() => {
                                                                    setActiveDateTaskId(null);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions Column with Dropdown */}
                                                <td className="py-3.5 px-5 align-middle text-right relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdownId(isMenuOpen ? null : taskId);
                                                        }}
                                                        className="p-1 text-[#41454d] hover:text-[#181d26] hover:bg-[#f8fafc] rounded-[6px] border border-transparent hover:border-[#dddddd] transition-colors cursor-pointer"
                                                        title="Actions"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>

                                                    {isMenuOpen && (
                                                        <div
                                                            ref={dropdownRef}
                                                            className="absolute right-8 top-2 z-50 text-left shadow-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <TaskDropdown
                                                                onShare={() => {
                                                                    setActiveDropdownId(null);
                                                                    setTaskToShare(task);
                                                                }}
                                                                onEdit={() => {
                                                                    setActiveDropdownId(null);
                                                                    setTaskToEdit(task);
                                                                }}
                                                                onView={() => {
                                                                    setActiveDropdownId(null);
                                                                    const taskId = task._id || task.id;
                                                                    if (taskId) {
                                                                        navigate(`/tasks/${taskId}`, { state: { from: '/tasks' } });
                                                                    }
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
                    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-[#dddddd] bg-white gap-3">
                        <p className="!text-xs text-[#41454d]">
                            Showing <span className="font-medium text-[#181d26]">{filteredTasks.length > 0 ? indexOfFirstTask + 1 : 0}&ndash;{Math.min(indexOfLastTask, filteredTasks.length)}</span> of <span className="font-medium text-[#181d26]">{filteredTasks.length}</span> tasks
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 !text-xs font-normal text-[#41454d] bg-white border border-[#dddddd] rounded-[6px] hover:text-[#181d26] hover:bg-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 !text-xs font-medium rounded-[6px] transition-colors cursor-pointer ${currentPage === page
                                            ? 'bg-[#181d26] text-white shadow-xs'
                                            : 'text-[#41454d] hover:bg-[#f8fafc] hover:text-[#181d26]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1.5 !text-xs font-normal text-[#41454d] bg-white border border-[#dddddd] rounded-[6px] hover:text-[#181d26] hover:bg-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Create Task Modal */}
            <CreateTask
                isOpen={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
            />

            {/* Edit Task Modal */}
            <EditTask
                isOpen={Boolean(taskToEdit)}
                task={taskToEdit}
                onClose={() => setTaskToEdit(null)}
                onDelete={(task) => {
                    setTaskToEdit(null);
                    setTaskToDelete(task);
                }}
            />

            {/* Integrated Delete Confirmation Modal */}
            <DeleteTaskModal
                isOpen={Boolean(taskToDelete)}
                task={taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />

            {/* Share Task Modal */}
            <ShareTaskModal
                isOpen={Boolean(taskToShare)}
                preselectedTask={taskToShare}
                onClose={() => setTaskToShare(null)}
            />
        </div>
    );
}
