import { useState } from 'react';
import { taskService } from '../../services/taskService';

function Task({ task, onTaskUpdated, onTaskDeleted, index, columnId }) {
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleTaskClick = () => {
        // TODO: Open task details modal
        console.log('Task clicked:', task.title);
    };

    const handleDeleteTask = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            setLoading(true);
            await taskService.deleteTask(task._id);

            if (onTaskDeleted) {
                onTaskDeleted(task._id);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)} days overdue`, className: 'text-red-600' };
        } else if (diffDays === 0) {
            return { text: 'Due today', className: 'text-amber-600' };
        } else if (diffDays === 1) {
            return { text: 'Due tomorrow', className: 'text-blue-600' };
        } else if (diffDays <= 7) {
            return { text: `Due in ${diffDays} days`, className: 'text-gray-600' };
        } else {
            return { text: date.toLocaleDateString(), className: 'text-gray-600' };
        }
    };

    const getAssigneeInitials = (assignee) => {
        const firstName = assignee.firstName || '';
        const lastName = assignee.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
    };

    const dueDateInfo = task.dueDate ? formatDate(task.dueDate) : null;

    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow relative group"
        >
            {/* Task Menu Button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    disabled={loading}
                >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div className="absolute right-0 top-8 w-36 bg-white rounded-md shadow-lg border z-20">
                        <div className="py-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskClick();
                                    setShowMenu(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Task
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask();
                                    setShowMenu(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                disabled={loading}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Task Content */}
            <div onClick={handleTaskClick} className="pr-6">
                {/* Task Title */}
                <div className="mb-2">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {task.title || 'Untitled Task'}
                    </h4>
                </div>

                {/* Task Description */}
                {task.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                {/* Task Meta Information */}
                <div className="space-y-2">
                    {/* Priority and Due Date Row */}
                    <div className="flex items-center justify-between">
                        {task.priority && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                        )}

                        {dueDateInfo && (
                            <span className={`text-xs ${dueDateInfo.className}`}>
                                {dueDateInfo.text}
                            </span>
                        )}
                    </div>

                    {/* Assignees */}
                    {task.assignees && task.assignees.length > 0 && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs text-gray-500 mr-2">Assigned to:</span>
                            </div>
                            <div className="flex -space-x-1">
                                {task.assignees.slice(0, 3).map((assignee, index) => (
                                    <div
                                        key={assignee._id || index}
                                        className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white"
                                        title={`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'Unknown User'}
                                    >
                                        {getAssigneeInitials(assignee)}
                                    </div>
                                ))}
                                {task.assignees.length > 3 && (
                                    <div className="w-6 h-6 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                                        +{task.assignees.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                    }}
                />
            )}
        </div>
    );
}

export default Task;