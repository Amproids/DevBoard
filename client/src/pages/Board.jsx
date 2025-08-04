import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardService } from '../services/boardService';

function Board() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // Fetch board data
    const fetchBoard = async () => {
        try {
            setLoading(true);
            setError(false);
            
            const response = await boardService.getBoardById(id);
            setBoard(response.data);
        } catch (error) {
            setError(true);
            console.error('Error fetching board:', error);
            
            // If board not found or no permission, redirect to dashboard
            if (error.response?.status === 404 || error.response?.status === 403) {
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBoard();
        }
    }, [id]);

    const handleBoardUpdate = (updatedBoard) => {
        setBoard(updatedBoard);
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getMemberCount = () => {
        return board?.members ? board.members.length : 0;
    };

    const getOwnerName = () => {
        if (!board?.owner) return 'Unknown';
        return `${board.owner.firstName || ''} ${board.owner.lastName || ''}`.trim() || 'Unknown';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Board Not Found</h3>
                        <p className="text-gray-500 mb-6">The board you're looking for doesn't exist or you don't have permission to view it.</p>
                        <button 
                            onClick={handleBackToDashboard}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Board Content */}
            {!loading && !error && board && (
                <>
                    {/* Board Header */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="container mx-auto px-4 py-4">
                            {/* Navigation */}
                            <div className="flex items-center mb-4">
                                <button 
                                    onClick={handleBackToDashboard}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Dashboard
                                </button>
                            </div>

                            {/* Board Title and Info */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.name}</h1>
                                    {board.description && (
                                        <p className="text-gray-600 mb-3">{board.description}</p>
                                    )}
                                    
                                    {/* Board Meta Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Owner: {getOwnerName()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                            <span>{getMemberCount()} members</span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 0a8 8 0 110 16m0-16V4" />
                                            </svg>
                                            <span>Created {formatDate(board.createdAt)}</span>
                                        </div>
                                        {board.lockedColumns && (
                                            <div className="flex items-center text-amber-600">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <span>Columns Locked</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {board.tags && board.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {board.tags.map((tag, index) => (
                                                <span 
                                                    key={index}
                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Board Actions */}
                                <div className="flex items-center gap-3">
                                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
                                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                        </svg>
                                        Settings
                                    </button>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Column
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Board Content Area */}
                    <div className="container mx-auto px-4 py-6">
                        {/* Columns Container - This will be replaced with actual Column components */}
                        <div className="flex gap-6 overflow-x-auto min-h-96">
                            {board.columns && board.columns.length > 0 ? (
                                board.columns.map((column, index) => (
                                    <div key={column._id || index} className="flex-shrink-0 w-80">
                                        {/* Placeholder Column Card */}
                                        <div className="bg-white rounded-lg shadow-sm border p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3">
                                                {column.name || `Column ${index + 1}`}
                                            </h3>
                                            <div className="text-sm text-gray-500 mb-4">
                                                {column.tasks ? `${column.tasks.length} tasks` : '0 tasks'}
                                            </div>
                                            {/* Placeholder for tasks */}
                                            <div className="space-y-2">
                                                {column.tasks && column.tasks.slice(0, 3).map((task, taskIndex) => (
                                                    <div key={task._id || taskIndex} className="bg-gray-50 p-3 rounded-md">
                                                        <div className="font-medium text-sm">{task.title || 'Untitled Task'}</div>
                                                        {task.description && (
                                                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                                                        )}
                                                    </div>
                                                ))}
                                                {column.tasks && column.tasks.length > 3 && (
                                                    <div className="text-center text-sm text-gray-500 py-2">
                                                        +{column.tasks.length - 3} more tasks
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                /* Empty State for Columns */
                                <div className="flex-1 flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No columns yet</h3>
                                        <p className="text-gray-500 mb-6">Add your first column to start organizing tasks</p>
                                        <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium">
                                            Add First Column
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Board;