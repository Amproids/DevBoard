import { useEffect, useState } from 'react';
import { boardService } from '../services/boardService';
import CreateBoardModal from '../components/Dashboard/CreateBoardModal.jsx';
import BoardPreviewCard from '../components/Dashboard/BoardPreviewCard.jsx';

function Dashboard() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Filter and sort state
    const [currentFilter, setCurrentFilter] = useState('all');
    const [currentSort, setCurrentSort] = useState('-createdAt');
    
    const filterOptions = [
        { value: 'all', label: 'All Boards' },
        { value: 'favorites', label: 'Favorites' },
        { value: 'owned', label: 'Owned by Me' }
    ];
    
    const sortOptions = [
        { value: '-createdAt', label: 'Newest First' },
        { value: 'createdAt', label: 'Oldest First' },
        { value: 'name', label: 'Name A-Z' },
        { value: '-name', label: 'Name Z-A' }
    ];

    // Fetch dashboard data from the server
    const fetchBoards = async (filter = currentFilter, sort = currentSort) => {
        try {
            setLoading(true);
            setError(false);
            
            const response = await boardService.getBoards({
                filter: filter,
                sort: sort
            });
            setBoards(response.data);
        } catch (error) {
            setError(true);
            console.error('Error fetching boards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleCreateBoard = () => {
        setShowCreateModal(true);
    };

    const handleBoardCreated = (newBoard) => {
        // Add the new board to the list
        setBoards(prev => [newBoard, ...prev]);
    };

    const handleBoardClick = (board) => {
        // TODO: Navigate to board detail view
        console.log('Board clicked:', board.name);
    };

    const handleBoardUpdated = (updatedBoard) => {
        // Update the board in the list
        setBoards(prev => prev.map(board => 
            board._id === updatedBoard._id ? updatedBoard : board
        ));
    };

    const handleFilterChange = (newFilter) => {
        setCurrentFilter(newFilter);
        fetchBoards(newFilter, currentSort);
    };

    const handleSortChange = (newSort) => {
        setCurrentSort(newSort);
        fetchBoards(currentFilter, newSort);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {!loading && !error && (
                <>
                    {/* Header with Create Button */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <button 
                            onClick={handleCreateBoard}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create Board
                        </button>
                    </div>

                    {/* Filters and Sort Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Filter:</label>
                                <select 
                                    value={currentFilter} 
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {filterOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Sort:</label>
                                <select 
                                    value={currentSort} 
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            {boards.length} board{boards.length !== 1 ? 's' : ''} found
                        </div>
                    </div>

                    {/* Boards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {boards.length > 0 ? (
                            boards.map((board) => (
                                <BoardPreviewCard 
                                    key={board._id} 
                                    board={board} 
                                    onClick={handleBoardClick}
                                    onBoardUpdated={handleBoardUpdated}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No boards yet</h3>
                                <p className="text-gray-500 mb-6">Create your first board to get started organizing your work</p>
                                <button 
                                    onClick={handleCreateBoard}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Create Your First Board
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-red-500 flex justify-center items-center h-[40vh]">
                    <div className="text-center">
                        <p className="mb-4">Server Error While Loading Dashboard.</p>
                        <button 
                            onClick={fetchBoards}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Create Board Modal */}
            <CreateBoardModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onBoardCreated={handleBoardCreated}
            />
        </div>
    );
}

export default Dashboard;