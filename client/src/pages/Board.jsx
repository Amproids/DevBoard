import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams, useNavigate } from 'react-router-dom';
import { boardService } from '../services/boardService';
import AddColumnModal from '../components/Column/AddColumnModal.jsx';
import Column from '../components/Column/Column.jsx';
import BoardTags from '../components/Board/BoardTags.jsx';
import BoardMetaInfo from '../components/Board/BoardMetaInfo.jsx';
import BackToDashboard from '../components/Board/BackToDashboard.jsx';
import EditBoardModal from '../components/Board/EditBoardModal.jsx';
import RemoveBoardModal from '../components/Board/RemoveBoardModal.jsx';
import ColumnDragLayer from '../components/Column/ColumnDragLayer.jsx';

function Board() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [lastDraggedColumn, setLastDraggedColumn] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [showEditBoardModal, setShowEditBoardModal] = useState(false);
    const [showRemoveBoardModal, setShowRemoveBoardModal] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

    // Fetch board data
    const fetchBoard = async () => {
        try {
            setLoading(true);
            setError(false);

            const response = await boardService.getBoardById(id);
            setBoard(response.data);
        } catch (error) {
            setError(true);

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
        const newBoard = { ...board, ...updatedBoard };
        setBoard(newBoard);
    };

    const handleAddColumn = () => {
        setShowAddColumnModal(true);
    };

    const handleColumnCreated = (newColumn) => {
        // Add the new column to the board
        setBoard(prev => ({
            ...prev,
            columns: [...(prev.columns || []), newColumn]
        }));
    };

    const handleColumnUpdated = (updatedColumn) => {
        // Update the column in the board
        setBoard(prev => ({
            ...prev,
            columns: prev.columns.map(col => col._id === updatedColumn._id ? updatedColumn : col)
        }));
    };

    const handleColumnDeleted = (deletedColumnId) => {
        // Remove the column from the board
        setBoard(prev => ({
            ...prev,
            columns: prev.columns.filter(col => col._id !== deletedColumnId)
        }));
    };

    // move the column to a new position
    const handleMoveColumn = (fromIndex, toIndex) => {
        setBoard(prev => {
            const columns = [...prev.columns];
            const [moved] = columns.splice(fromIndex, 1);
            columns.splice(toIndex, 0, moved);
            return { ...prev, columns };
        });
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
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
                            className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
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
                            {/* Back to Dashboard Navigation */}
                            <BackToDashboard handleBackToDashboard={handleBackToDashboard} />

                            {/* Board Title and Info */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.name}</h1>
                                    {board.description && (
                                        <p className="text-gray-600 mb-3">{board.description}</p>
                                    )}

                                    {/* Board Meta Info */}
                                    <BoardMetaInfo board={board} />

                                    {/* Board Tags */}
                                    <BoardTags tags={board.tags} />

                                </div>

                                {/* Board Actions */}
                                <div className="flex items-center gap-3">
                                    <div>

                                        {/* Dropdown for setting*/}
                                        <div className="relative">
                                            <button
                                                className="cursor-pointer flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                                onClick={() => setShowSettingsDropdown(prev => !prev)}
                                                aria-haspopup="true"
                                                aria-expanded={showSettingsDropdown}
                                            >
                                                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                                </svg>
                                                Settings
                                            </button>
                                            {showSettingsDropdown && (
                                                <div className="absolute md:right-0 mt-4 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                                    <ul className="py-1">
                                                        <li>
                                                            <button
                                                                className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                onClick={() => {
                                                                    setShowEditBoardModal(true);
                                                                    setShowSettingsDropdown(false);
                                                                }}
                                                            >
                                                                Edit Board
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                onClick={() => {
                                                                    setShowRemoveBoardModal(true);
                                                                    setShowSettingsDropdown(false);
                                                                }}
                                                            >
                                                                Delete Board
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                    <button
                                        onClick={handleAddColumn}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
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
                    <DndProvider backend={HTML5Backend}>
                        <div className="container mx-auto px-4 py-6">
                            {/* Drag Preview Layer */}
                            <ColumnDragLayer
                                columns={board.columns}
                                boardId={id}
                                onColumnUpdated={handleColumnUpdated}
                                onColumnDeleted={handleColumnDeleted}
                                onMoveColumn={handleMoveColumn}
                            />
                            {/* Columns Container */}
                            <div className="flex gap-6 overflow-x-auto min-h-96">
                                {board.columns && board.columns.length > 0 ? (
                                    board.columns.map((column, index) => (
                                        <Column
                                            key={column._id}
                                            column={column}
                                            boardId={id}
                                            isSkeleton={lastDraggedColumn?._id === column._id}
                                            index={index}
                                            onMoveColumn={handleMoveColumn}
                                            onColumnUpdated={handleColumnUpdated}
                                            onColumnDeleted={handleColumnDeleted}
                                            setLastDraggedColumn={setLastDraggedColumn}
                                        />
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
                    </DndProvider>
                </>
            )}
            {/* Edit Board Modal*/}
            <EditBoardModal
                isOpen={showEditBoardModal}
                onClose={() => setShowEditBoardModal(false)}
                board={board}
                onBoardUpdated={handleBoardUpdate}
            />

            {/* Remove Board Modal*/}
            <RemoveBoardModal
                isOpen={showRemoveBoardModal}
                onClose={() => setShowRemoveBoardModal(false)}
                boardId={board?._id}
            />

            {/* Add Column Modal */}
            <AddColumnModal
                isOpen={showAddColumnModal}
                onClose={() => setShowAddColumnModal(false)}
                boardId={id}
                onColumnCreated={handleColumnCreated}
            />
        </div>
    );
}

export default Board;