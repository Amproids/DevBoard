import { useEffect, useRef, useState } from 'react';
import { columnService } from '../../services/columnService';
import AddTaskModal from '../Task/AddTaskModal.jsx';
import Task from '../Task/Task.jsx';
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd';
import { getEmptyImage } from "react-dnd-html5-backend";

const COLUMN_TYPE = 'COLUMN';

function Column({
    column,
    index,
    isSkeleton = false,
    setLastDraggedColumn,
    onColumnUpdated,
    onColumnDeleted,
    onMoveColumn
}) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [columnName, setColumnName] = useState(column.name);
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [{ isDragging }, dragRef, previewRef] = useDrag({
        type: COLUMN_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        }),
        end: (item, monitor) => {
            setLastDraggedColumn(null);
        }
    });
    const ref = useRef(null);
    const [_, dropRef] = useDrop({
        accept: COLUMN_TYPE,
        hover: (item, monitor) => {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const hoverRect = ref.current.getBoundingClientRect();
            const hoverMiddleX = (hoverRect.right - hoverRect.left) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientX = clientOffset.x - hoverRect.left;

            // Only move when the mouse crosses the middle of the target
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

            onMoveColumn(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
        drop: (item) => {
            console.log('Column dropped:', item.index, 'to', index);
            setLastDraggedColumn(null);
        }
    });
    dragRef(dropRef(ref));

    // Hide default preview and use custom one
    useEffect(() => {
        previewRef(getEmptyImage(), { captureDraggingState: true });
    }, [previewRef]);

    useEffect(() => {
        if (isDragging) {
            setLastDraggedColumn(column);
        }
    }, [isDragging, column, setLastDraggedColumn]);

    const handleNameEdit = async () => {
        if (!columnName.trim() || columnName === column.name) {
            setColumnName(column.name);
            setIsEditingName(false);
            return;
        }

        try {
            setLoading(true);
            setIsEditingName(false);
            const response = await columnService.updateColumn(column._id, {
                name: columnName.trim()
            });

            if (onColumnUpdated) {
                onColumnUpdated(response.data);
            }
        } catch (error) {
            console.error('Error updating column name:', error);
            setColumnName(column.name); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleNameEdit();
        } else if (e.key === 'Escape') {
            setColumnName(column.name);
            setIsEditingName(false);
        }
    };

    const handleToggleLock = async () => {
        try {
            setLoading(true);
            const response = await columnService.toggleColumnLock(column._id, !column.isLocked);

            if (onColumnUpdated) {
                onColumnUpdated(response.data);
            }
            setShowMenu(false);
        } catch (error) {
            console.error('Error toggling column lock:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteColumn = async () => {
        if (!window.confirm('Are you sure you want to delete this column? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            if (onColumnDeleted) {
                onColumnDeleted(column._id);
            }
            await columnService.deleteColumn(column._id, {
                action: 'delete-tasks' // or 'move' - for now we'll just delete tasks
            });
        } catch (error) {
            console.error('Error deleting column:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = () => {
        setShowAddTaskModal(true);
    };

    const handleTaskCreated = (newTask) => {
        // Add the new task to the column
        if (onColumnUpdated) {
            const updatedColumn = {
                ...column,
                tasks: [...(column.tasks || []), newTask]
            };
            onColumnUpdated(updatedColumn);
        }
    };

    const handleTaskUpdated = (updatedTask) => {
        // Update the task in the column
        if (onColumnUpdated) {
            const updatedColumn = {
                ...column,
                tasks: column.tasks.map(task =>
                    task._id === updatedTask._id ? updatedTask : task
                )
            };
            onColumnUpdated(updatedColumn);
        }
    };

    const handleTaskDeleted = (deletedTaskId) => {
        // Remove the task from the column
        if (onColumnUpdated) {
            const updatedColumn = {
                ...column,
                tasks: column.tasks.filter(task => task._id !== deletedTaskId)
            };
            onColumnUpdated(updatedColumn);
        }
    };

    const getTaskCount = () => {
        return column.tasks ? column.tasks.length : 0;
    };

    return (
        <div
            ref={ref}
            className={`relative flex-shrink-0 w-72 mr-4 ${isDragging || (isSkeleton) ? 'opacity-10' : ''}`}
        >
            <div className="bg-white rounded-lg shadow-lg border border-gray-300">
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        {/* Column Name */}
                        {isEditingName ? (
                            <input
                                type="text"
                                value={columnName}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setColumnName(e.target.value);
                                }}
                                onBlur={handleNameEdit}
                                onKeyDown={handleKeyPress}
                                className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                                disabled={loading}
                                autoFocus
                                maxLength={50}
                            />
                        ) : (
                            <h3
                                className="flex-1 text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => !column.isLocked && setIsEditingName(true)}
                                title={column.isLocked ? 'Column is locked' : 'Click to edit name'}
                            >
                                {columnName}
                            </h3>
                        )}

                        {/* Column Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                                disabled={loading}
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-300 z-10">
                                    <div className="py-1">
                                        <button
                                            onClick={handleToggleLock}
                                            className="flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            disabled={loading}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={column.isLocked ? "M8 11V7a4 4 0 118 0m-4 0v4m0 0a4 4 0 110 8m0-8a4 4 0 110-8z" : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"} />
                                            </svg>
                                            {column.isLocked ? 'Unlock Column' : 'Lock Column'}
                                        </button>
                                        <button
                                            onClick={handleDeleteColumn}
                                            className="flex items-center cursor-pointer w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            disabled={loading}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Column
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{getTaskCount()} tasks</span>
                        {column.isLocked && (
                            <div className="flex items-center text-amber-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-xs">Locked</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks Container */}
                <div className="p-4">
                    <div className="space-y-3 min-h-[200px]">
                        {column.tasks && column.tasks.length > 0 ? (
                            column.tasks.map((task) => (
                                <Task
                                    key={task._id}
                                    task={task}
                                    onTaskUpdated={handleTaskUpdated}
                                    onTaskDeleted={handleTaskDeleted}
                                />
                            ))
                        ) : (
                            /* Empty State */
                            <div className="text-center py-8 text-gray-500">
                                <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-sm">No tasks yet</p>
                            </div>
                        )}
                    </div>

                    {/* Add Task Button */}
                    {!column.isLocked && (
                        <button
                            onClick={handleAddTask}
                            className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-sm">Add Task</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowMenu(false)}
                />
            )}

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                columnId={column._id}
                onTaskCreated={handleTaskCreated}
            />
        </div>
    );
}

export default Column;