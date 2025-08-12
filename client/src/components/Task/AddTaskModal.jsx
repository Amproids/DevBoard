import { useState } from 'react';
import { taskService } from '../../services/taskService';

function AddTaskModal({ isOpen, onClose, columnId, onTaskCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignees: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Task title is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const taskData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                ...(formData.dueDate && { dueDate: formData.dueDate }),
                ...(formData.assignees.length > 0 && {
                    assignees: formData.assignees
                })
            };

            const response = await taskService.createTask(columnId, taskData);

            // Call the callback to refresh column data
            if (onTaskCreated) {
                onTaskCreated(response.data);
            }

            // Reset form and close modal
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                assignees: []
            });
            onClose();
        } catch (error) {
            console.error('Error creating task:', error);
            setError(error.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            dueDate: '',
            assignees: []
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add New Task</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Task Title */}
                    <div className="mb-4">
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Task Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task title"
                            disabled={loading}
                            maxLength={100}
                        />
                    </div>

                    {/* Task Description */}
                    <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task description"
                            rows={3}
                            disabled={loading}
                            maxLength={500}
                        />
                    </div>

                    {/* Priority */}
                    <div className="mb-4">
                        <label
                            htmlFor="priority"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Due Date */}
                    <div className="mb-4">
                        <label
                            htmlFor="dueDate"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Due Date (Optional)
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                            min={new Date().toISOString().split('T')[0]} // Minimum date is today
                        />
                    </div>

                    {/* Note about assignees */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700">
                            <svg
                                className="inline w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            You can assign team members to this task after
                            creating it.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 text-red-600 text-sm">{error}</div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading || !formData.title.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTaskModal;
