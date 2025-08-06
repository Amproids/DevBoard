import React from 'react';

const BackToDashboard = ({ handleBackToDashboard }) => {
	return (
		<div className="flex items-center mb-4">
			<button
				onClick={handleBackToDashboard}
				className="cursor-pointer flex items-center text-gray-600 hover:text-gray-900 transition-colors"
			>
				<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
				Back to Dashboard
			</button>
		</div>
	);
};

export default BackToDashboard;