import { useState } from 'react';
import { columnService } from '../../services/columnService';
import AddTaskModal from '../Task/AddTaskModal.jsx';
import Task from '../Task/Task.jsx';

function Column({ column, boardId, onColumnUpdated, onColumnDeleted, columnIndex, onColumnDragStart, onColumnDragEnd }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [columnName, setColumnName] = useState(column.name);
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);

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

    const getTaskCount = () => column.tasks ? column.tasks.length : 0;

    // Drag handlers for the header
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
            <div className="bg-white rounded-lg shadow-sm border">
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

                {/* Tasks - NOT DRAGGABLE */}
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
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No tasks yet</p>
                            </div>
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