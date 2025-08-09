import React, { useEffect, useState } from 'react';
import Modal from '../Shared/Modal';
import { boardService } from '../../services/boardService';
import CreateTags from '../Shared/CreateTags';

const EditBoardModal = ({ isOpen, onClose, board, onBoardUpdated }) => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		tags: [],
		_id: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (board) {
			setFormData(board);
		}
	}, [board, isOpen]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
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

			const updatedBoardData = {
				name: formData.name.trim(),
				tags: formData.tags || []
			};

			if (formData.description.trim()) {
				updatedBoardData.description = formData.description.trim();
			}
			
			const response = await boardService.updateBoard(formData._id, updatedBoardData);

			onBoardUpdated(updatedBoardData);

			onClose();
		} catch (error) {
			console.error('Error updating board:', error);
			setError('Failed to update board');
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setError('');
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Edit Board">
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
						{loading ? 'Updating...' : 'Update Board'}
					</button>
				</div>
			</form>
		</Modal>
	);
};

export default EditBoardModal;