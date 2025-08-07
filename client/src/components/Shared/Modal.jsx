import React from 'react';
import ReactDOM from 'react-dom';

function Modal({ isOpen, onClose, children, title }) {
	if (!isOpen) return null;

	const handleClose = () => {
		onClose();
	};

	return ReactDOM.createPortal(
		<div className="fixed inset-0 bg-[#333333db] overflow-y-auto bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">{title}</h2>
					<button
						onClick={handleClose}
						className="text-gray-500 cursor-pointer hover:text-gray-700"
					>
						✕
					</button>
				</div>
				<div>{children}</div>
			</div>
		</div>,
		document.getElementById('modal-root')
	);
}

export default Modal;