import { useState } from 'react';
import { boardService } from '../../services/boardService';

function BoardPreviewCard({ board, onClick, onBoardUpdated }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFavorite, setIsFavorite] = useState(board.isFavorite || false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getMemberCount = () => {
        return board.members ? board.members.length : 0;
    };

    const getOwnerName = () => {
        if (!board.owner) return 'Unknown';
        return `${board.owner.firstName || ''} ${board.owner.lastName || ''}`.trim() || 'Unknown';
    };

    const handleFavoriteToggle = async (e) => {
        e.stopPropagation(); // Prevent card click when clicking favorite
        
        try {
            setIsUpdating(true);
            const newFavoriteStatus = !isFavorite;
            
            // Optimistic update
            setIsFavorite(newFavoriteStatus);
            
            // Call API
            const response = await boardService.updateBoard(board._id, {
                isFavorite: newFavoriteStatus
            });
            
            // Notify parent component if needed
            if (onBoardUpdated) {
                onBoardUpdated(response.data);
            }
            
        } catch (error) {
            // Revert optimistic update on error
            setIsFavorite(!isFavorite);
            console.error('Error updating favorite status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 relative"
            onClick={() => onClick && onClick(board)}
        >
            {/* Favorite Button */}
            <button
                onClick={handleFavoriteToggle}
                disabled={isUpdating}
                className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <svg 
                    className={`w-5 h-5 transition-colors ${
                        isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'
                    }`} 
                    fill={isFavorite ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                </svg>
            </button>

            {/* Board Header */}
            <div className="mb-3 pr-8">{/* Add right padding to avoid favorite button */}
                <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
                    {board.name}
                </h3>
                {board.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                        {board.description}
                    </p>
                )}
            </div>

            {/* Tags */}
            {board.tags && board.tags.length > 0 && (
                <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                        {board.tags.slice(0, 3).map((tag, index) => (
                            <span 
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {board.tags.length > 3 && (
                            <span className="text-gray-500 text-xs px-2 py-1">
                                +{board.tags.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Board Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span>{getMemberCount()} members</span>
                    </div>
                    
                    {board.lockedColumns && (
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Locked</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Board Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <div>
                    <span>Created {formatDate(board.createdAt)}</span>
                </div>
                <div>
                    <span>by {getOwnerName()}</span>
                </div>
            </div>
        </div>
    );
}

export default BoardPreviewCard;