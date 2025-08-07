import { useState } from 'react';
import { columnService } from '../../services/columnService';

function AddColumnModal({ isOpen, onClose, boardId, onColumnCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        isLocked: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('Column name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const columnData = {
                name: formData.name.trim(),
                isLocked: formData.isLocked
            };

            const response = await columnService.createColumn(boardId, columnData);

            // Call the callback to refresh board data
            if (onColumnCreated) {
                onColumnCreated(response.data);
            }

            // Reset form and close modal
            setFormData({ name: '', isLocked: false });
            onClose();
        } catch (error) {
            console.error('Error creating column:', error);
            setError(error.response?.data?.message || 'Failed to create column');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', isLocked: false });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add New Column</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Column Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter column name"
                            disabled={loading}
                            maxLength={50}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isLocked"
                                checked={formData.isLocked}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Lock column (prevents modifications)</span>
                        </label>
                    </div>

                    {error && (
                        <div className="mb-4 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 cursor-pointer border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading || !formData.name.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Column'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddColumnModal;