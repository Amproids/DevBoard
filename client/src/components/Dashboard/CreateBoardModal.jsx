import { useState } from 'react';
import { boardService } from '../../services/boardService';
import CreateTags from '../Shared/CreateTags';

function CreateBoardModal({ isOpen, onClose, onBoardCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tags: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Board name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const boardData = {
                name: formData.name.trim(),
                tags: formData.tags || []
            };

            // Only include description if it's not empty
            if (formData.description.trim()) {
                boardData.description = formData.description.trim();
            }

            const response = await boardService.createBoard(boardData);

            // Call the callback to refresh boards list
            if (onBoardCreated) {
                onBoardCreated(response.data);
            }

            // Reset form and close modal
            setFormData({ name: '', description: '', tags: [] });
            onClose();
        } catch (error) {
            console.error('Error creating board:', error);
            setError(error.response?.data?.message || 'Failed to create board');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', description: '', tags: [] });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#333333db] overflow-y-auto bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Create New Board</h2>
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
                            Board Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter board name"
                            disabled={loading}
                            maxLength={50}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter board description"
                            rows={3}
                            disabled={loading}
                            maxLength={200}
                        />
                    </div>
                    <div className="mb-10">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Tags (Optional)
                        </p>
                        <CreateTags
                            tags={formData.tags}
                            setTags={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                        />
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
                            className="px-4 py-2 cursor-pointer text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading || !formData.name.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Board'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateBoardModal;