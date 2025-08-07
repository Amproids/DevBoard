import React, { useState } from 'react';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CreateTags = ({ tags, setTags }) => {
	const [isAdding, setIsAdding] = useState(false);
	const [newTag, setNewTag] = useState('');

	const handleAddTag = () => {
		if (newTag.trim()) {
			setTags([...tags, newTag.trim()]);
			setNewTag('');
			setIsAdding(false);
		}
	};

	const handleRemoveTag = (index) => {
		setTags(tags.filter((_, i) => i !== index));
	};

	return (
		<div className='flex flex-wrap gap-2'>
			{/* case when there is no tag */}
			{tags && tags.length == 0 && (
				<div className='flex items-center gap-2'>
					<input
						type="text"
						value={newTag}
						onChange={(e) => setNewTag(e.target.value)}
						placeholder="Enter tag"
						aria-label='Enter tag'
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleAddTag();
						}}
						className='px-3 sm py-2 ring w-30 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md'
					/>
					<CheckIcon
						className='cursor-pointer text-green-500 w-4 h-4'
						onClick={handleAddTag}
					/>
				</div>
			)}
			{/* case when there are tags */}
			{tags && tags.length > 0 && (
				<div className='flex flex-wrap gap-2 items-center'>
					{tags.map((tag, index) => (
						<div
							key={index}
							className='flex items-center bg-gray-100 rounded-md px-3 py-2'
						>
							<span>{tag}</span>
							<XMarkIcon
								className='ml-2 cursor-pointer text-red-500 w-4 h-4'
								onClick={() => handleRemoveTag(index)}
							/>
						</div>
					))}
					{isAdding ? (
						<div className='flex items-center gap-2'>
							<input
								type="text"
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								placeholder="Enter tag"
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleAddTag();
								}}
								className='px-2 py-1 border w-30 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md'
							/>
							<CheckIcon
								className='cursor-pointer text-green-500 w-4 h-4'
								onClick={handleAddTag}
							/>
							<XMarkIcon
								className='cursor-pointer text-red-500 w-4 h-4'
								onClick={() => setIsAdding(false)}
							/>
						</div>
					) : (
						<PlusIcon
							style={{ cursor: 'pointer', color: 'blue', width: '20px', height: '20px' }}
							onClick={() => setIsAdding(true)}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default CreateTags;