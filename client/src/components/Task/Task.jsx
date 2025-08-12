import { useState } from 'react';
import { taskService } from '../../services/taskService';
import EditTaskModal from './EditTaskModal';

function Task({ task, onTaskUpdated, onTaskDeleted, onTaskDragStart, onTaskDragEnd, isDraggable = true }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleTaskClick = () => {
        // Don't open details if we're dragging
        if (isDragging) return;
        
        // Open edit modal when task is clicked
        setShowEditModal(true);
    };

    const handleEditTask = () => {
        setShowEditModal(true);
        setShowMenu(false);
    };

    const handleCheckboxChange = async (e) => {
        e.stopPropagation(); // Prevent triggering handleTaskClick
        
        const newCompletedStatus = e.target.checked;
        const updateData = { completed: newCompletedStatus };
        
        console.log('Updating task:', task._id, 'with data:', updateData);
        
        try {
            setLoading(true);
            // Update the task completion status
            const updatedTask = await taskService.updateTask(task._id, updateData);
            
            console.log('Task updated successfully:', updatedTask);
            
            if (onTaskUpdated) {
                // Pass the updated task data from the response
                onTaskUpdated(updatedTask.data || updatedTask);
            }
        } catch (error) {
            console.error('Error updating task completion:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
            // Revert checkbox if update failed
            e.target.checked = !newCompletedStatus;
        } finally {
            setLoading(false);
        }
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
    const isCompleted = task.completed || false;

    // Drag event handlers
    const handleDragStart = (e) => {
        // Don't allow dragging if not draggable
        if (!isDraggable) {
            e.preventDefault();
            return;
        }
        
        setIsDragging(true);
        
        // Call parent's drag start handler
        if (onTaskDragStart) {
            onTaskDragStart(e);
        }
    };

    const handleDragEnd = (e) => {
        setIsDragging(false);
        
        // Call parent's drag end handler
        if (onTaskDragEnd) {
            onTaskDragEnd(e);
        }
    };

    // Prevent drag events from bubbling to column when clicking interactive elements
    const handleInteractiveDragStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <>
            <div 
                className={`
                    bg-white border border-gray-200 rounded-lg p-3 
                    hover:shadow-md transition-all relative group 
                    ${isCompleted ? 'opacity-75' : ''}
                    ${isDraggable ? 'cursor-move' : 'cursor-pointer'}
                    ${isDragging ? 'opacity-50 rotate-1 scale-105' : ''}
                `}
                draggable={isDraggable}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={handleTaskClick}
            >
                {/* Drag Handle Indicator - only show when draggable */}
                {isDraggable && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity">
                        <svg className="w-3 h-5 text-gray-400" fill="currentColor" viewBox="0 0 8 20">
                            <circle cx="2" cy="2" r="1.5"/>
                            <circle cx="6" cy="2" r="1.5"/>
                            <circle cx="2" cy="7" r="1.5"/>
                            <circle cx="6" cy="7" r="1.5"/>
                            <circle cx="2" cy="12" r="1.5"/>
                            <circle cx="6" cy="12" r="1.5"/>
                            <circle cx="2" cy="17" r="1.5"/>
                            <circle cx="6" cy="17" r="1.5"/>
                        </svg>
                    </div>
                )}

                {/* Task Menu Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        onDragStart={handleInteractiveDragStart}
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
                                        handleEditTask();
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
                <div className="pr-6">
                    {/* Checkbox and Task Title */}
                    <div className="mb-2 flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            onDragStart={handleInteractiveDragStart}
                            disabled={loading}
                            className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                        <h4 className={`font-medium text-sm text-gray-900 line-clamp-2 flex-1 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {task.title || 'Untitled Task'}
                        </h4>
                    </div>
                    
                    {/* Task Description */}
                    {task.description && (
                        <div className="ml-7">
                            <p className={`text-xs text-gray-600 line-clamp-2 mb-3 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Task Meta Information */}
                    <div className="space-y-2 ml-7">
                        {/* Priority and Due Date Row */}
                        <div className="flex items-center justify-between">
                            {task.priority && (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)} ${isCompleted ? 'opacity-60' : ''}`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                            )}
                            
                            {dueDateInfo && (
                                <span className={`text-xs ${dueDateInfo.className} ${isCompleted ? 'opacity-60' : ''}`}>
                                    {dueDateInfo.text}
                                </span>
                            )}
                        </div>

                        {/* Assignees */}
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className={`w-3 h-3 text-gray-400 mr-1 ${isCompleted ? 'opacity-60' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className={`text-xs text-gray-500 mr-2 ${isCompleted ? 'opacity-60' : ''}`}>Assigned to:</span>
                                </div>
                                <div className={`flex -space-x-1 ${isCompleted ? 'opacity-60' : ''}`}>
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

            {/* Edit Task Modal */}
            <EditTaskModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                task={task}
                onTaskUpdated={onTaskUpdated}
            />
        </>
    );
}

export default Task;