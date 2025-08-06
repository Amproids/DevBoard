import React from 'react';

const BoardTags = ({ tags }) => {
	if (!tags || tags.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2 mt-3">
			{tags.map((tag, index) => (
				<span
					key={index}
					className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
				>
					{tag}
				</span>
			))}
		</div>
	);
};

export default BoardTags;