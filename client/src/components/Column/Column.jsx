import { useState } from 'react';
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
        
        // Add visual feedback - hide the original task being dragged
        e.target.style.opacity = '0.3';
        // Add a class to identify the dragged task for hiding
        e.target.classList.add('task-being-dragged');
    };

    const handleTaskDragEnd = (e) => {
        e.target.style.opacity = '1';
        e.target.classList.remove('task-being-dragged');
        setDraggedOverTaskIndex(null);
        setIsDraggedOver(false);
    };

    const handleTaskDragOver = (e, taskIndex) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't process if column is locked
        if (column.isLocked) return;
        
        e.dataTransfer.dropEffect = 'move';
        setDraggedOverTaskIndex(taskIndex);
        setIsDraggedOver(true);
    };

    const handleTaskDragLeave = (e) => {
        // Only clear if we're leaving the tasks container entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
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
        // Only clear if we're leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDraggedOver(false);
            setDraggedOverTaskIndex(null);
        }
    };

    const handleTaskDrop = async (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (column.isLocked) return;
        
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
            const { taskId, task, sourceColumnId, sourceIndex } = dragData;
            
            // DEBUG: Log initial state
            console.log('=== TASK DROP DEBUG ===');
            console.log('Source Column ID:', sourceColumnId);
            console.log('Target Column ID:', column._id);
            console.log('Source Index:', sourceIndex);
            console.log('Drop Index:', dropIndex);
            console.log('Same Column?', sourceColumnId === column._id);
            console.log('Current column tasks:', column.tasks.map(t => ({id: t._id, title: t.title})));
            
            // If dropping in the same column and same position, do nothing
            if (sourceColumnId === column._id && sourceIndex === dropIndex) {
                console.log('SAME POSITION - ABORTING');
                setDraggedOverTaskIndex(null);
                setIsDraggedOver(false);
                return;
            }
            
            // Prepare the move data
            const moveData = {
                targetColumnId: column._id,
                newOrder: dropIndex
            };
            
            // DEBUG: Log what we're sending to backend
            console.log('Move data being sent:', moveData);
            console.log('Task being moved:', { id: taskId, title: task.title });
            
            // Create new tasks array with the task inserted at the correct position
            const currentTasks = column.tasks || [];
            const newTasks = [...currentTasks];
            
            // If moving within the same column, remove from old position first
            if (sourceColumnId === column._id) {
                console.log('WITHIN COLUMN MOVE');
                console.log('Tasks before reorder:', newTasks.map(t => t.title));
                
                newTasks.splice(sourceIndex, 1);
                console.log('After removal:', newTasks.map(t => t.title));
                
                // Adjust drop index if moving down within the same column
                const adjustedDropIndex = dropIndex > sourceIndex ? dropIndex - 1 : dropIndex;
                newTasks.splice(adjustedDropIndex, 0, task);
                console.log('After insertion:', newTasks.map(t => t.title));
            } else {
                // Moving from different column, just insert at drop position
                console.log('CROSS COLUMN MOVE');
                console.log('Target column tasks before:', column.tasks.map(t => t.title));
                
                newTasks.splice(dropIndex, 0, task);
                
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
            
            // Call API to persist the move
            console.log('Calling API with:', { taskId, moveData });
            const response = await taskService.moveTask(taskId, moveData);
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

    const handleEmptyColumnDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (column.isLocked) return;
        
        // Only handle drop if there are no tasks
        if (column.tasks && column.tasks.length > 0) return;
        
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
            const { taskId, task, sourceColumnId } = dragData;
            
            // If dropping in the same empty column, do nothing
            if (sourceColumnId === column._id) {
                setIsDraggedOver(false);
                return;
            }
            
            // Prepare the move data
            const moveData = {
                targetColumnId: column._id,
                newOrder: 0
            };
            
            // Optimistically update UI
            const updatedColumn = { ...column, tasks: [task] };
            onColumnUpdated(updatedColumn);
            
            // Also update the source column if we have access to all columns
            if (onAllColumnsUpdated && allColumns) {
                const updatedColumns = allColumns.map(col => {
                    if (col._id === sourceColumnId) {
                        return {
                            ...col,
                            tasks: col.tasks.filter(t => t._id !== taskId)
                        };
                    } else if (col._id === column._id) {
                        return updatedColumn;
                    }
                    return col;
                });
                onAllColumnsUpdated(updatedColumns);
            }
            
            // Call API to persist the move
            await taskService.moveTask(taskId, moveData);
            
        } catch (error) {
            console.error('Error moving task to empty column:', error);
            alert('Failed to move task. Please try again.');
            // Refresh to revert the optimistic update
            window.location.reload();
        } finally {
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
                onDrop={handleEmptyColumnDrop}
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
                                    {/* Placeholder above task - also acts as drop zone */}
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
                                    
                                    <div
                                        onDragOver={(e) => handleTaskDragOver(e, index)}
                                        onDrop={(e) => handleTaskDrop(e, index)}
                                        className={draggedOverTaskIndex === index ? 'opacity-0' : ''}
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
                            >
                                <p className="text-sm">
                                    {isDraggedOver && !column.isLocked ? 'Drop task here' : 'No tasks yet'}
                                </p>
                            </div>
                        )}
                        
                        {/* Placeholder at the end of tasks list - also acts as drop zone */}
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