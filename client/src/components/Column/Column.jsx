import { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { columnService } from '../../services/columnService';
import { taskService } from '../../services/taskService';
import AddTaskModal from '../Task/AddTaskModal.jsx';
import Task from '../Task/Task.jsx';

function Column({
    column,
    onColumnUpdated,
    onColumnDeleted,
    allColumns,
    onAllColumnsUpdated
}) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [columnName, setColumnName] = useState(column.name);
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);

    // Animation state to prevent interactions during animations
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle when ReactSortable wants to move/reorder elements (preview)
    const handleMove = () => {
        // Block all moves if column is locked
        if (column.isLocked) {
            return false;
        }

        // If already animating a preview, block new ones
        if (isAnimating) {
            return false; // Returning false prevents the move
        }

        // Allow the move and set animation lock
        setIsAnimating(true);

        // Clear the lock after animation completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 250); // Slightly longer than the 200ms animation

        return true; // Allow the move
    };

    // Local tasks state for sortable
    const [tasks, setTasks] = useState(column.tasks || []);

    // Update local tasks when column tasks change
    useEffect(() => {
        setTasks(column.tasks || []);
    }, [column.tasks]);

    // Helper function to adjust index based on placeholder presence
    const adjustIndexForPlaceholder = (index, hasPlaceholder) => {
        if (!hasPlaceholder) return index;

        // If there's a placeholder at index 0 and we're inserting at index 0,
        // we actually want to insert at the beginning of tasks (index 0)
        if (index === 0) return 0;

        // For any other index, subtract 1 to account for placeholder
        return Math.max(0, index - 1);
    };

    const handleNameEdit = async () => {
        // Prevent editing if column is locked
        if (column.isLocked) {
            setColumnName(column.name);
            setIsEditingName(false);
            return;
        }

        if (!columnName.trim() || columnName === column.name) {
            setColumnName(column.name);
            setIsEditingName(false);
            return;
        }
        try {
            setLoading(true);
            const response = await columnService.updateColumn(column._id, {
                name: columnName.trim()
            });
            if (onColumnUpdated) {
                onColumnUpdated(response.data);
            }
            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating column name:', error);
            setColumnName(column.name);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = e => {
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
            const response = await columnService.toggleColumnLock(
                column._id,
                !column.isLocked
            );
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
        // Prevent deletion if column is locked
        if (column.isLocked) {
            alert('Cannot delete a locked column. Please unlock it first.');
            setShowMenu(false);
            return;
        }

        if (!window.confirm('Are you sure you want to delete this column?'))
            return;
        try {
            setLoading(true);
            await columnService.deleteColumn(column._id, {
                action: 'delete-tasks'
            });
            if (onColumnDeleted) {
                onColumnDeleted(column._id);
            }
        } catch (error) {
            console.error('Error deleting column:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = () => {
        // Prevent adding tasks if column is locked
        if (column.isLocked) {
            return;
        }
        setShowAddTaskModal(true);
    };

    const handleTaskCreated = newTask => {
        // Prevent task creation if column is locked
        if (column.isLocked) {
            return;
        }

        if (onColumnUpdated) {
            const updatedColumn = {
                ...column,
                tasks: [...(column.tasks || []), newTask]
            };
            onColumnUpdated(updatedColumn);
        }
    };

    const handleTaskUpdated = updatedTask => {
        // Allow task updates even in locked columns (for completion status, etc.)
        // This is a design decision - you might want to restrict this too
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

    const handleTaskDeleted = deletedTaskId => {
        // Prevent task deletion if column is locked
        if (column.isLocked) {
            alert('Cannot delete tasks from a locked column. Please unlock the column first.');
            return;
        }

        if (onColumnUpdated) {
            const updatedColumn = {
                ...column,
                tasks: column.tasks.filter(task => task._id !== deletedTaskId)
            };
            onColumnUpdated(updatedColumn);
        }
    };

    // Handle task reordering within the same column
    const handleTaskSort = async (newTasks, sortableEvent) => {
        // Prevent sorting if column is locked
        if (column.isLocked) {
            return;
        }

        // Guard against null sortableEvent (can happen on initial render)
        if (!sortableEvent) {
            return;
        }

        const { oldIndex, newIndex, from, to } = sortableEvent;

        // If no change in position, return early
        if (oldIndex === newIndex && from === to) {
            return;
        }

        // Filter out any invalid tasks
        const validTasks = newTasks.filter(task => task && task._id);

        // Update local state immediately for smooth UI
        setTasks(validTasks);

        // Update parent component
        const updatedColumn = { ...column, tasks: validTasks };
        onColumnUpdated(updatedColumn);
    };

    // Handle when task reordering finishes (API call)
    const handleTaskEnd = async evt => {
        // Prevent task reordering if column is locked
        if (column.isLocked) {
            return;
        }

        const { oldIndex, newIndex, from, to } = evt;

        // Only handle same-column moves here (cross-column moves are handled by onAdd)
        if (from === to) {
            // Check if this is a valid same-column move
            const hasPlaceholder = tasks.length === 0;
            const adjustedOldIndex = adjustIndexForPlaceholder(
                oldIndex,
                hasPlaceholder
            );
            const adjustedNewIndex = adjustIndexForPlaceholder(
                newIndex,
                hasPlaceholder
            );

            // If no change in position after adjustment, return early
            if (adjustedOldIndex === adjustedNewIndex) {
                return;
            }

            try {
                const taskToMove = tasks[adjustedNewIndex] || tasks[0]; // Fallback to first task
                if (!taskToMove) {
                    return;
                }

                const moveData = {
                    targetColumnId: column._id,
                    newOrder: adjustedNewIndex
                };

                await taskService.moveTask(taskToMove._id, moveData);
            } catch (error) {
                console.error('Error moving task:', error);
                // Revert on error
                setTasks(column.tasks || []);
                alert('Failed to move task. Please try again.');
            }
        }
    };

    // Handle cross-column task moves
    const handleTaskAdd = async evt => {
        // Prevent adding tasks to locked column
        if (column.isLocked) {
            alert('Cannot move tasks to a locked column. Please unlock it first.');
            return false;
        }

        const { item, newIndex } = evt;

        // Get the task data from the item's data attribute
        const taskData = JSON.parse(item.getAttribute('data-task'));
        const sourceColumnId = item.getAttribute('data-source-column');

        // Check if source column is locked (prevent moving FROM locked columns)
        const sourceColumn = allColumns?.find(col => col._id === sourceColumnId);
        if (sourceColumn?.isLocked) {
            alert('Cannot move tasks from a locked column. Please unlock it first.');
            return false;
        }

        // Check if target column has placeholder
        const targetHasPlaceholder = tasks.length === 0;
        const adjustedNewIndex = adjustIndexForPlaceholder(
            newIndex,
            targetHasPlaceholder
        );

        try {
            // Update backend with adjusted index
            const moveData = {
                targetColumnId: column._id,
                newOrder: adjustedNewIndex
            };

            await taskService.moveTask(taskData._id, moveData);

            // Update all columns if callback is available
            if (onAllColumnsUpdated && allColumns) {
                const updatedColumns = allColumns.map(col => {
                    if (col._id === sourceColumnId) {
                        // Remove from source
                        return {
                            ...col,
                            tasks: col.tasks.filter(t => t._id !== taskData._id)
                        };
                    } else if (col._id === column._id) {
                        // Add to target at correct adjusted position
                        const newTasks = [...(col.tasks || [])];
                        newTasks.splice(adjustedNewIndex, 0, taskData);
                        return {
                            ...col,
                            tasks: newTasks
                        };
                    }
                    return col;
                });
                onAllColumnsUpdated(updatedColumns);
            }
        } catch (error) {
            console.error('Error in cross-column move:', error);
            alert('Failed to move task. Please refresh the page.');
        }
    };

    // Handle when task is removed from this column (going to another column)
    const handleTaskRemove = evt => {
        // Prevent removing tasks from locked column
        if (column.isLocked) {
            return false;
        }

        const { oldIndex } = evt;

        // Adjust index for placeholder if needed
        const hasPlaceholder = tasks.length === 1; // Will be 1 because we haven't removed yet
        const adjustedOldIndex = adjustIndexForPlaceholder(
            oldIndex,
            hasPlaceholder
        );

        // Remove from local state using adjusted index
        const newTasks = tasks.filter((_, index) => index !== adjustedOldIndex);
        setTasks(newTasks);

        // Update parent
        const updatedColumn = { ...column, tasks: newTasks };
        onColumnUpdated(updatedColumn);
    };

    const getTaskCount = () => (column.tasks ? column.tasks.length : 0);

    return (
        <div className="flex-shrink-0 w-80">
            <div
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                    column.isLocked ? 'border-amber-300' : ''
                }`}
            >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200 select-none">
                    <div className="flex items-center justify-between mb-2">
                        {isEditingName && !column.isLocked ? (
                            <input
                                type="text"
                                value={columnName}
                                onChange={e => setColumnName(e.target.value)}
                                onBlur={handleNameEdit}
                                onKeyDown={handleKeyPress}
                                className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none cursor-text"
                                disabled={loading}
                                autoFocus
                                maxLength={50}
                            />
                        ) : (
                            <h3
                                className={`flex-1 text-lg font-semibold text-gray-900 ${
                                    !column.isLocked ? 'cursor-pointer hover:text-blue-600' : 'cursor-default'
                                }`}
                                onClick={() =>
                                    !column.isLocked && setIsEditingName(true)
                                }
                                title={column.isLocked ? 'Column is locked - unlock to edit' : 'Click to edit name'}
                            >
                                {column.name}
                                {column.isLocked && (
                                    <svg className="inline w-4 h-4 ml-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </h3>
                        )}

                        <div className="relative">
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                                disabled={loading}
                            >
                                <svg
                                    className="w-5 h-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 5v.01M12 12v.01M12 19v.01"
                                    />
                                </svg>
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border z-10">
                                    <div className="py-1">
                                        <button
                                            onClick={handleToggleLock}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            disabled={loading}
                                        >
                                            {column.isLocked ? (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                    </svg>
                                                    Unlock Column
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Lock Column
                                                </>
                                            )}
                                        </button>
                                        {!column.isLocked && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingName(true);
                                                        setShowMenu(false);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    disabled={loading}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Rename Column
                                                </button>
                                                <button
                                                    onClick={handleDeleteColumn}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    disabled={loading}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Column
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{getTaskCount()} tasks</span>
                        {column.isLocked && (
                            <span className="text-xs text-amber-600 font-medium">
                                🔒 Locked
                            </span>
                        )}
                    </div>
                </div>

                {/* Tasks Container with ReactSortable */}
                <div className="p-4">
                    {!column.isLocked ? (
                        <ReactSortable
                            list={tasks}
                            setList={handleTaskSort}
                            group="tasks"
                            animation={200}
                            delay={0}
                            delayOnTouchStart={true}
                            ghostClass="sortable-ghost"
                            chosenClass="sortable-chosen"
                            dragClass="sortable-drag"
                            dragoverBubble={false}
                            onAdd={handleTaskAdd}
                            onRemove={handleTaskRemove}
                            onEnd={handleTaskEnd}
                            onMove={handleMove}
                            className="space-y-3 min-h-[200px]"
                            style={{ minHeight: '200px' }}
                        >
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <div
                                        key={task._id}
                                        data-task={JSON.stringify(task)}
                                        data-source-column={column._id}
                                        className="cursor-move"
                                    >
                                        <Task
                                            task={task}
                                            onTaskUpdated={handleTaskUpdated}
                                            onTaskDeleted={handleTaskDeleted}
                                            isDraggable={true}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 select-none">
                                    <p className="text-sm">No tasks yet</p>
                                </div>
                            )}
                        </ReactSortable>
                    ) : (
                        // Locked column - no drag and drop
                        <div className="space-y-3 min-h-[200px]">
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <div key={task._id}>
                                        <Task
                                            task={task}
                                            onTaskUpdated={handleTaskUpdated}
                                            onTaskDeleted={handleTaskDeleted}
                                            isDraggable={false}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">No tasks yet</p>
                                    <p className="text-xs mt-1 text-amber-600">Column is locked</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!column.isLocked ? (
                        <button
                            onClick={handleAddTask}
                            className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                            disabled={loading}
                        >
                            + Add Task
                        </button>
                    ) : (
                        <div className="w-full mt-3 p-3 border-2 border-dashed border-amber-200 rounded-lg text-amber-500 text-center cursor-not-allowed">
                            Column Locked
                        </div>
                    )}
                </div>
            </div>

            {showMenu && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowMenu(false)}
                />
            )}

            <AddTaskModal
                isOpen={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                columnId={column._id}
                onTaskCreated={handleTaskCreated}
            />

            {/* Add CSS for sortable styling */}
            <style>
                {`
                .sortable-ghost {
                    opacity: 0.4;
                    background: #f3f4f6;
                    border: 2px dashed #3b82f6;
                    border-radius: 8px;
                }
                
                .sortable-chosen {
                    cursor: grabbing !important;
                }
                
                .sortable-drag {
                    opacity: 0.8;
                    transform: rotate(5deg);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
                    border: 2px solid #3b82f6;
                    z-index: 9999;
                }
                `}
            </style>
        </div>
    );
}

export default Column;