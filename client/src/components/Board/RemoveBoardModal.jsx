import React, { useState } from 'react';
import Modal from '../Shared/Modal';
import { boardService } from '../../services/boardService';
import { useNavigate } from 'react-router-dom';

const RemoveBoardModal = ({ isOpen, onClose, boardId}) => {
	const [confirmationText, setConfirmationText] = useState('');
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState({ success: false, message: '' });
	const navigate = useNavigate();

	const handleInputChange = (e) => {
		setConfirmationText(e.target.value);
	};

	const handleRemove = async () => {
		if (confirmationText !== 'DEACTIVATE') {
			setStatus({ success: false, message: 'You must type DEACTIVATE to confirm.' });
			return;
		}

		try {
			setLoading(true);
			setStatus({ success: false, message: '' });

			await boardService.deleteBoard(boardId);

			setStatus({ success: true, message: 'Board removed successfully!' });

			// Navigate to the dashboard after a delay
			setTimeout(() => {
				navigate('/dashboard');
			}, 2000); // 2 seconds delay
		} catch (error) {
			console.error('Error removing board:', error);
			setStatus({ success: false, message: 'Failed to remove board, try again later' });
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setStatus({ success: false, message: '' });
		setConfirmationText('');
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Remove Board">
			<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
				<p className="text-red-800 text-sm">
					<strong>Warning:</strong> Removing this board will permanently delete all its data. This action cannot be undone.
				</p>
			</div>

			<div className="flex flex-col mb-4">
				<label htmlFor="confirmation" className="mb-2 text-sm font-medium">
					Type "DEACTIVATE" to confirm board deletion:
				</label>
				<input
					type="text"
					id="confirmation"
					value={confirmationText}
					onChange={handleInputChange}
					className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
					placeholder="DEACTIVATE"
					disabled={loading}
				/>
			</div>

			{status.message && (
				<div className={`mt-4 mb-6 text-sm ${status.success ? 'text-green-500' : 'text-red-500'}`}>
					{status.message}
				</div>
			)}

			<div className="flex gap-3 justify-end">
				<button
					type="button"
					onClick={handleClose}
					className="py-2 px-4 cursor-pointer text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
					disabled={loading}
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={handleRemove}
					className={`py-2 px-4 rounded-lg focus:outline-none focus:ring-0 transition-colors ${confirmationText === 'DEACTIVATE' && !loading
						? 'cursor-pointer bg-red-50 border-red-200 border text-black hover:bg-red-100'
						: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
					disabled={loading || confirmationText !== 'DEACTIVATE'}
				>
					{loading ? 'Removing...' : 'Remove Board'}
				</button>
			</div>
		</Modal>
	);
};

export default RemoveBoardModal;