import { useState } from 'react';
import {
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    Plus,
    MoreHorizontal
} from 'lucide-react';

export default function TaskPage() {
    const [activeTab, setActiveTab] = useState('All Tasks');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const tasks = [
        {
            id: 1,
            status: 'Default',
            title: 'Finalize Quarterly Engineering Sprint Scope',
            description: 'Define epic deliverables, milestones, and resource allocation',
            priority: 'High',
            dueDate: 'Nov 02, 2026',
            isOverdue: false,
        },
        {
            id: 2,
            status: 'Default',
            title: 'Update Database Migration Scripts for MongoDB Cluster',
            description: 'Ensure index schemas match models and constraints',
            priority: 'Medium',
            dueDate: 'Nov 04, 2026',
            isOverdue: false,
        },
        {
            id: 3,
            status: 'Default',
            title: 'Review API Documentation and Postman Collections',
            description: 'Validate request and response contracts',
            priority: 'Low',
            dueDate: 'Nov 08, 2026',
            isOverdue: false,
        },
        {
            id: 4,
            status: 'Overdue',
            title: 'Deploy Production Security Hotfix for Auth Middleware',
            description: 'Apply JWT verification hardening',
            priority: 'High',
            dueDate: 'Nov 01, 2026',
            isOverdue: true,
        },
        {
            id: 5,
            status: 'Default',
            title: 'Refactor Friend Controller Request Deduplication',
            description: 'Prevent simultaneous pending request race conditions',
            priority: 'Medium',
            dueDate: 'Nov 12, 2026',
            isOverdue: false,
        },
        {
            id: 6,
            status: 'Default',
            title: 'Prepare Application Shell Theme Switcher Spec',
            description: 'Coordinate CSS variable tokens for Dark Mode',
            priority: 'Low',
            dueDate: 'Nov 15, 2026',
            isOverdue: false,
        },
    ];

    const tabs = ['All Tasks', 'High Priority', 'Medium Priority', 'Low Priority'];

    // Priority badge styling helper
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-red-50 text-red-700 border border-red-200/60';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border border-amber-200/60';
            case 'Low':
                return 'bg-slate-100 text-slate-700 border border-slate-200/60';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityDot = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-red-500';
            case 'Medium':
                return 'bg-amber-500';
            case 'Low':
                return 'bg-slate-400';
            default:
                return 'bg-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
                        <p className="text-sm text-slate-500 mt-0.5">8 active personal tasks recorded</p>
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#5558E6] text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
                        <Plus className="w-4 h-4" />
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
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors relative cursor-pointer ${isActive
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

                {/* Controls Bar (Search + Filters + Sort) */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by title..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all shadow-xs"
                        />
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
                            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                            Filters
                        </button>
                        <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
                            <ArrowUpDown className="w-4 h-4 text-slate-500" />
                            Due date
                        </button>
                    </div>
                </div>

                {/* Task Table Container */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                    <th className="py-3 px-6 w-32"></th>
                                    <th className="py-3 px-2">Task Title & Description</th>
                                    <th className="py-3 px-6 w-32">Priority</th>
                                    <th className="py-3 px-6 w-36">Due Date</th>
                                    <th className="py-3 px-6 w-24 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/60 transition-colors group">
                                        {/* Status Column */}
                                        <td className="py-4 px-6 align-middle">
                                            <span className={`text-xs font-medium ${task.status === 'Overdue' ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                                                {task.status}
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

                                        {/* Due Date Column */}
                                        <td className="py-4 px-6 align-middle text-xs">
                                            {task.isOverdue ? (
                                                <span className="text-rose-600 font-medium leading-tight block">
                                                    {task.dueDate} <span className="block text-[11px]">· Overdue</span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">{task.dueDate}</span>
                                            )}
                                        </td>

                                        {/* Actions Column */}
                                        <td className="py-4 px-6 align-middle text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-white gap-3">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-medium text-slate-700">1–6</span> of <span className="font-medium text-slate-700">8</span> tasks
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(1)}
                                className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors cursor-pointer ${currentPage === 1
                                        ? 'bg-[#6366F1] text-white shadow-xs'
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                1
                            </button>
                            <button
                                onClick={() => setCurrentPage(2)}
                                className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors cursor-pointer ${currentPage === 2
                                        ? 'bg-[#6366F1] text-white shadow-xs'
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                2
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, 2))}
                                disabled={currentPage === 2}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}