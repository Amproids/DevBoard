import { useState, useEffect, useRef } from 'react';
import { columnService } from '../../services/columnService';
import { taskService } from '../../services/taskService';
import AddTaskModal from '../Task/AddTaskModal.jsx';
import Task from '../Task/Task.jsx';

function Column({ column, boardId, onColumnUpdated, onColumnDeleted, columnIndex, onColumnDragStart, onColumnDragEnd, allColumns, onAllColumnsUpdated }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [columnName, setColumnName] = useState(column.name);
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    
    // Task drag-and-drop state
    const [draggedOverTaskIndex, setDraggedOverTaskIndex] = useState(null);
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    
    // Track which task is being dragged for making it translucent instead of hidden
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    
    // Ref for creating custom drag ghost
    const ghostRef = useRef(null);

    // Safety cleanup for stuck drag states
    useEffect(() => {
        const handleDragEnd = () => {
            setDraggedOverTaskIndex(null);
            setIsDraggedOver(false);
            setDraggedTaskId(null);
        };
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setDraggedOverTaskIndex(null);
                setIsDraggedOver(false);
                setDraggedTaskId(null);
            }
        };
        
        document.addEventListener('dragend', handleDragEnd);
        document.addEventListener('keydown', handleEscape);
        
        return () => {
            document.removeEventListener('dragend', handleDragEnd);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    // Create a ghost element for drag preview
    const createDragGhost = (task, originalElement) => {
        // Create a clone of the task element
        const ghost = originalElement.cloneNode(true);
        
        // Reset any display none that might be on the clone
        ghost.style.display = 'block';
        
        // Style the ghost
        ghost.style.position = 'fixed';
        ghost.style.top = '-1000px';
        ghost.style.left = '-1000px';
        ghost.style.width = originalElement.offsetWidth + 'px';
        ghost.style.height = originalElement.offsetHeight + 'px';
        ghost.style.opacity = '0.9';
        ghost.style.transform = 'rotate(5deg)';
        ghost.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
        ghost.style.border = '2px solid #3b82f6';
        ghost.style.borderRadius = '8px';
        ghost.style.backgroundColor = '#ffffff';
        ghost.style.zIndex = '9999';
        ghost.style.pointerEvents = 'none';
        
        // Add a subtle animation class if you have CSS for it
        ghost.classList.add('drag-ghost');
        
        // Append to body temporarily
        document.body.appendChild(ghost);
        
        return ghost;
    };

    const handleNameEdit = async () => {
        if (!columnName.trim() || columnName === column.name) {
            setColumnName(column.name);
            setIsEditingName(false);
            return;
        }
        try {
            setLoading(true);
            const response = await columnService.updateColumn(column._id, { name: columnName.trim() });
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
        if (!window.confirm('Are you sure you want to delete this column?')) return;
        try {
            setLoading(true);
            await columnService.deleteColumn(column._id, { action: 'delete' });
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
        setShowAddTaskModal(true);
    };

    const handleTaskCreated = (newTask) => {
        if (onColumnUpdated) {
            const updatedColumn = { ...column, tasks: [...(column.tasks || []), newTask] };
            onColumnUpdated(updatedColumn);
        }
    };

    const handleTaskUpdated = (updatedTask) => {
        if (onColumnUpdated) {
            const updatedColumn = {
                ...column,
                tasks: column.tasks.map(task => task._id === updatedTask._id ? updatedTask : task)
            };
            onColumnUpdated(updatedColumn);
        }
    };

    const handleTaskDeleted = (deletedTaskId) => {
        if (onColumnUpdated) {
            const updatedColumn = {
                ...column,
                tasks: column.tasks.filter(task => task._id !== deletedTaskId)
            };
            onColumnUpdated(updatedColumn);
        }
    };

    // Task drag-and-drop handlers
    const handleTaskDragStart = (e, task, taskIndex) => {
        // Store dragged task data in dataTransfer
        const dragData = {
            taskId: task._id,
            task: task,
            sourceColumnId: column._id,
            sourceIndex: taskIndex
        };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        
        // Create and set custom drag image
        const taskElement = e.target.closest('[data-task-id]');
        if (taskElement) {
            const ghost = createDragGhost(task, taskElement);
            ghostRef.current = ghost;
            
            // Set the custom drag image
            e.dataTransfer.setDragImage(ghost, 160, 40); // Center the ghost on cursor
            
            // Clean up the ghost after a brief delay
            setTimeout(() => {
                if (ghost && ghost.parentNode) {
                    ghost.parentNode.removeChild(ghost);
                }
            }, 0);
        }
        
        // Make the original task translucent instead of hiding it
        setDraggedTaskId(task._id);
    };

    const handleTaskDragEnd = (e) => {
        // Restore the task visibility
        setDraggedTaskId(null);
        
        // Clear drag states
        setDraggedOverTaskIndex(null);
        setIsDraggedOver(false);
        
        // Clean up any remaining ghost elements
        if (ghostRef.current && ghostRef.current.parentNode) {
            ghostRef.current.parentNode.removeChild(ghostRef.current);
            ghostRef.current = null;
        }
    };

    const handleTaskDragOver = (e, taskIndex) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't process if column is locked
        if (column.isLocked) return;
        
        // Just show placeholder above this task when hovering
        console.log('Current state:', draggedOverTaskIndex, 'New index:', taskIndex);
        if (draggedOverTaskIndex === taskIndex) {
            setDraggedOverTaskIndex(taskIndex + 1);
        } else {
            setDraggedOverTaskIndex(taskIndex);
        };
        setIsDraggedOver(true);
    };

    const handleTaskDragLeave = (e) => {
        // Get the bounding rectangle of the tasks container
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // Check if the mouse is actually outside the container bounds
        const isOutside = (
            x < rect.left || 
            x > rect.right || 
            y < rect.top || 
            y > rect.bottom
        );
        
        // Only clear if we're actually leaving the container
        if (isOutside) {
            setDraggedOverTaskIndex(null);
            setIsDraggedOver(false);
        }
    };

    const handleColumnDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't process if column is locked
        if (column.isLocked) return;
        
        e.dataTransfer.dropEffect = 'move';
        setIsDraggedOver(true);
    };

    const handleColumnDragLeave = (e) => {
        // Improved logic for column drag leave
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        const isOutside = (
            x < rect.left || 
            x > rect.right || 
            y < rect.top || 
            y > rect.bottom
        );
        
        if (isOutside) {
            setIsDraggedOver(false);
            setDraggedOverTaskIndex(null);
        }
    };

    const handleTaskDrop = async (e, dropIndex = null) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (column.isLocked) return;
        
        // If dropIndex is null, we're dropping on empty column area (index 0)
        const actualDropIndex = dropIndex !== null ? dropIndex : 0;
        
        // If column has tasks but dropIndex is null, ignore (shouldn't happen with proper event handling)
        if (dropIndex === null && column.tasks && column.tasks.length > 0) return;
        
        try {
            const rawData = e.dataTransfer.getData('application/json');
            if (!rawData || rawData.trim() === '') return;
            
            const dragData = JSON.parse(rawData);
            const { taskId, task, sourceColumnId, sourceIndex } = dragData;
            
            // DEBUG: Log initial state
            console.log('=== TASK DROP DEBUG ===');
            console.log('Source Column ID:', sourceColumnId);
            console.log('Target Column ID:', column._id);
            console.log('Source Index:', sourceIndex);
            console.log('Drop Index:', actualDropIndex);
            console.log('Same Column?', sourceColumnId === column._id);
            console.log('Is Empty Column Drop?', dropIndex === null);
            console.log('Current column tasks:', column.tasks?.map(t => ({id: t._id, title: t.title})) || []);
            
            // If dropping in the same column and same position, do nothing
            if (sourceColumnId === column._id && sourceIndex === actualDropIndex) {
                console.log('SAME POSITION - ABORTING');
                setDraggedOverTaskIndex(null);
                setIsDraggedOver(false);
                return;
            }
            
            // Special case: dropping in same empty column
            if (sourceColumnId === column._id && dropIndex === null) {
                console.log('SAME EMPTY COLUMN - ABORTING');
                setDraggedOverTaskIndex(null);
                setIsDraggedOver(false);
                return;
            }
            
            // Prepare the move data
            const moveData = {
                targetColumnId: column._id,
                newOrder: actualDropIndex
            };
            
            // DEBUG: Log what we're sending to backend
            console.log('Move data being sent:', moveData);
            console.log('Task being moved:', { id: taskId, title: task.title });
            
            // Create new tasks array with the task inserted at the correct position
            const currentTasks = column.tasks || [];
            const newTasks = [...currentTasks];
            
            // If moving within the same column, handle the reordering carefully
            if (sourceColumnId === column._id) {
                console.log('WITHIN COLUMN MOVE');
                console.log('Tasks before reorder:', newTasks.map(t => t.title));
                console.log('Moving from index', sourceIndex, 'to index', actualDropIndex);
                
                // Special handling for moving to the end position
                if (actualDropIndex >= newTasks.length) {
                    // Moving to the end - remove from current position and push to end
                    const [movedTask] = newTasks.splice(sourceIndex, 1);
                    newTasks.push(movedTask);
                    console.log('Moved to end:', newTasks.map(t => t.title));
                } else {
                    // Regular reordering
                    const [movedTask] = newTasks.splice(sourceIndex, 1);
                    console.log('After removal:', newTasks.map(t => t.title));
                    
                    // Calculate the correct insertion index
                    // If moving down, the index doesn't need adjustment since we already removed the item
                    // If moving up, the index is correct as-is
                    const insertIndex = actualDropIndex > sourceIndex ? actualDropIndex - 1 : actualDropIndex;
                    
                    // Ensure insertIndex is within bounds
                    const safeInsertIndex = Math.min(insertIndex, newTasks.length);
                    
                    newTasks.splice(safeInsertIndex, 0, movedTask);
                    console.log('After insertion at index', safeInsertIndex, ':', newTasks.map(t => t.title));
                }
            } else {
                // Moving from different column, just insert at drop position
                console.log('CROSS COLUMN MOVE');
                console.log('Target column tasks before:', currentTasks.map(t => t.title));
                
                // Ensure actualDropIndex is within bounds for cross-column moves
                const safeDropIndex = Math.min(actualDropIndex, newTasks.length);
                newTasks.splice(safeDropIndex, 0, task);
                
                console.log('Target column tasks after:', newTasks.map(t => t.title));
            }
            
            // Optimistically update UI
            const updatedColumn = { ...column, tasks: newTasks };
            onColumnUpdated(updatedColumn);
            
            // Also update other columns if we have access to all columns
            if (onAllColumnsUpdated && allColumns) {
                const updatedColumns = allColumns.map(col => {
                    if (col._id === sourceColumnId && sourceColumnId !== column._id) {
                        // Remove task from source column
                        return {
                            ...col,
                            tasks: col.tasks.filter(t => t._id !== taskId)
                        };
                    } else if (col._id === column._id) {
                        // Update target column
                        return updatedColumn;
                    }
                    return col;
                });
                onAllColumnsUpdated(updatedColumns);
            }
            
            // For backend API, we need to send the correct final position
            // When moving within the same column to the end, send the length of the final array
            let backendMoveData = moveData;
            if (sourceColumnId === column._id && actualDropIndex >= currentTasks.length) {
                backendMoveData = {
                    ...moveData,
                    newOrder: newTasks.length - 1 // The task is now at the end
                };
            } else if (sourceColumnId === column._id) {
                // For within-column moves, calculate the final position
                const finalIndex = newTasks.findIndex(t => t._id === taskId);
                backendMoveData = {
                    ...moveData,
                    newOrder: finalIndex
                };
            }
            
            // Call API to persist the move
            console.log('Calling API with:', { taskId, backendMoveData });
            const response = await taskService.moveTask(taskId, backendMoveData);
            console.log('API Response:', response);
            
        } catch (error) {
            console.error('Error moving task:', error);
            // Show error message to user
            alert('Failed to move task. Please try again.');
            // Refresh the board to revert the optimistic update
            window.location.reload();
        } finally {
            setDraggedOverTaskIndex(null);
            setIsDraggedOver(false);
        }
    };

    const getTaskCount = () => column.tasks ? column.tasks.length : 0;

    // Drag handlers for the column header
    const handleDragStart = (e) => {
        if (isEditingName) {
            e.preventDefault();
            return false;
        }
        
        if (onColumnDragStart) {
            onColumnDragStart(e);
        }
    };

    const handleDragEnd = (e) => {
        if (onColumnDragEnd) {
            onColumnDragEnd(e);
        }
    };

    return (
        <div className="flex-shrink-0 w-80">
            <div 
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                    isDraggedOver && !column.isLocked ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                } ${
                    isDraggedOver && column.isLocked ? 'ring-2 ring-red-400 ring-opacity-50 opacity-75' : ''
                }`}
                onDragOver={handleColumnDragOver}
                onDragLeave={handleColumnDragLeave}
            >
                {/* Column Header - DRAGGABLE AREA */}
                <div 
                    className="p-4 border-b border-gray-200 select-none"
                    draggable={!isEditingName}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    style={{ 
                        cursor: isEditingName ? 'default' : 'move',
                        userSelect: 'none'
                    }}
                >
                    <div className="flex items-center justify-between mb-2">
                        {isEditingName ? (
                            <input
                                type="text"
                                value={columnName}
                                onChange={(e) => setColumnName(e.target.value)}
                                onBlur={handleNameEdit}
                                onKeyDown={handleKeyPress}
                                className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none cursor-text"
                                disabled={loading}
                                autoFocus
                                maxLength={50}
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                            />
                        ) : (
                            <h3
                                className="flex-1 text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                                onClick={() => !column.isLocked && setIsEditingName(true)}
                            >
                                {column.name}
                            </h3>
                        )}

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                                disabled={loading}
                                onDragStart={(e) => e.preventDefault()}
                                draggable={false}
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
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
                                            {column.isLocked ? 'Unlock Column' : 'Lock Column'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingName(true);
                                                setShowMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            disabled={loading}
                                        >
                                            Rename Column
                                        </button>
                                        <button
                                            onClick={handleDeleteColumn}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            disabled={loading}
                                        >
                                            Delete Column
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{getTaskCount()} tasks</span>
                        {column.isLocked && <span className="text-xs text-amber-600">Locked</span>}
                    </div>
                </div>

                {/* Tasks Container */}
                <div 
                    className="p-4"
                    onDragOver={handleColumnDragOver}
                    onDragLeave={handleTaskDragLeave}
                >
                    <div className="space-y-3 min-h-[200px]">
                        {column.tasks && column.tasks.length > 0 ? (
                            column.tasks.map((task, index) => (
                                <div key={task._id}>
                                    {/* Placeholder above task - pushes task down */}
                                    {draggedOverTaskIndex === index && !column.isLocked && (
                                        <div 
                                            className="h-24 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg mb-3 animate-pulse"
                                            onDrop={(e) => handleTaskDrop(e, index)}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        />
                                    )}
                                    
                                    {/* The actual task - hidden with display: none if being dragged */}
                                    <div
                                        style={{ 
                                            display: draggedTaskId === task._id ? 'none' : 'block' 
                                        }}
                                        onDragOver={(e) => handleTaskDragOver(e, index)}
                                        onDrop={(e) => handleTaskDrop(e, index)}
                                        data-task-id={task._id}
                                    >
                                        <Task
                                            task={task}
                                            onTaskUpdated={handleTaskUpdated}
                                            onTaskDeleted={handleTaskDeleted}
                                            onTaskDragStart={(e) => handleTaskDragStart(e, task, index)}
                                            onTaskDragEnd={handleTaskDragEnd}
                                            isDraggable={!column.isLocked}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div 
                                className={`text-center py-8 text-gray-500 ${
                                    isDraggedOver && !column.isLocked ? 'opacity-50' : ''
                                }`}
                                onDrop={(e) => handleTaskDrop(e)}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <p className="text-sm">
                                    {isDraggedOver && !column.isLocked ? 'Drop task here' : 'No tasks yet'}
                                </p>
                            </div>
                        )}
                        
                        {/* Placeholder at the end of tasks list */}
                        {column.tasks && column.tasks.length > 0 && draggedOverTaskIndex === column.tasks.length && !column.isLocked && (
                            <div 
                                className="h-24 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg animate-pulse"
                                onDrop={(e) => handleTaskDrop(e, column.tasks.length)}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            />
                        )}
                        
                        {/* Drop zone at the end of the list */}
                        {column.tasks && column.tasks.length > 0 && (
                            <div
                                className="h-4"
                                onDragOver={(e) => handleTaskDragOver(e, column.tasks.length)}
                                onDrop={(e) => handleTaskDrop(e, column.tasks.length)}
                            />
                        )}
                    </div>
                    
                    {!column.isLocked && (
                        <button
                            onClick={handleAddTask}
                            className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700"
                            disabled={loading}
                        >
                            Add Task
                        </button>
                    )}
                </div>
            </div>

            {showMenu && (
                <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
            )}

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