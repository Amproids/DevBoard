import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardService } from '../services/boardService';
import AddColumnModal from '../components/Column/AddColumnModal.jsx';
import Column from '../components/Column/Column.jsx';
import BoardTags from '../components/Board/BoardTags.jsx';
import BoardMetaInfo from '../components/Board/BoardMetaInfo.jsx';
import BackToDashboard from '../components/Board/BackToDashboard.jsx';
import EditBoardModal from '../components/Board/EditBoardModal.jsx';
import RemoveBoardModal from '../components/Board/RemoveBoardModal.jsx';
import TeamModal from '../components/Team/TeamModal.jsx';

function Board() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [showEditBoardModal, setShowEditBoardModal] = useState(false);
    const [showRemoveBoardModal, setShowRemoveBoardModal] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

    // Drag and drop state for columns
    const [draggedColumn, setDraggedColumn] = useState(null);
    const [draggedOver, setDraggedOver] = useState(null);

    console.log('Board ID:', board);

    const fetchBoard = async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await boardService.getBoardById(id);
            setBoard(response.data);
        } catch (error) {
            setError(true);
            console.error('Error fetching board:', error);
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

    const handleAddColumn = () => {
        setShowAddColumnModal(true);
    };

    const handleColumnCreated = (newColumn) => {
        setBoard(prev => ({
            ...prev,
            columns: [...(prev.columns || []), newColumn]
        }));
    };

    const handleColumnUpdated = (updatedColumn) => {
        setBoard(prev => ({
            ...prev,
            columns: prev.columns.map(col =>
                col._id === updatedColumn._id ? updatedColumn : col
            )
        }));
    };

    const handleColumnDeleted = (deletedColumnId) => {
        setBoard(prev => ({
            ...prev,
            columns: prev.columns.filter(col => col._id !== deletedColumnId)
        }));
    };

    // Handler for updating all columns at once (used for task moves between columns)
    const handleAllColumnsUpdated = (updatedColumns) => {
        setBoard(prev => ({
            ...prev,
            columns: updatedColumns
        }));
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    // Drag and drop handlers for columns
    const handleColumnDragStart = (e, column, index) => {
        setDraggedColumn({ column, index });
        e.dataTransfer.effectAllowed = 'move';

        // Set column drag data with type identifier
        const dragData = {
            type: 'COLUMN_DRAG',
            columnId: column._id,
            columnIndex: index
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));

        // Find the entire column wrapper and apply opacity
        const columnWrapper = e.target.closest('.column-wrapper');
        if (columnWrapper) {
            columnWrapper.style.opacity = '0.5';
        }

        // Prevent the drag image from causing scroll issues
        const dragImage = new Image();
        dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        e.dataTransfer.setDragImage(dragImage, 0, 0);
    };

    const handleColumnDragEnd = (e) => {
        // Find the entire column wrapper and reset opacity
        const columnWrapper = e.target.closest('.column-wrapper');
        if (columnWrapper) {
            columnWrapper.style.opacity = '1';
        }

        setDraggedColumn(null);
        setDraggedOver(null);
    };

    const handleColumnDragOver = (e, index) => {
        e.preventDefault();
        setDraggedOver(index);
    };

    const handleColumnDragLeave = () => {
        setDraggedOver(null);
    };

    const handleColumnDrop = async (e, dropIndex) => {
        e.preventDefault();

        if (draggedColumn && draggedColumn.index !== dropIndex) {
            const newColumns = [...board.columns];
            const draggedItem = newColumns[draggedColumn.index];

            // Remove the dragged item
            newColumns.splice(draggedColumn.index, 1);

            // Insert at new position
            newColumns.splice(dropIndex, 0, draggedItem);

            // Update board state immediately for UI responsiveness
            setBoard(prev => ({
                ...prev,
                columns: newColumns
            }));

            // Update column order
            try {
                await boardService.updateColumnOrder(id, newColumns.map(col => col._id));
            } catch (error) {
                // Revert on error
                fetchBoard();
            }
        }

        setDraggedOver(null);
        setDraggedColumn(null);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {loading && (
                <div className="flex justify-center items-center flex-1">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            )}

            {error && (
                <div className="flex justify-center items-center flex-1">
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

            {!loading && !error && board && (
                <>
                    {/* Header - Fixed height to prevent layout shifts */}
                    <div className="bg-white shadow-sm border-b flex-shrink-0">
                        <div className="container mx-auto px-4 py-4">
                            <BackToDashboard handleBackToDashboard={handleBackToDashboard} />
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.name}</h1>
                                    {board.description && (
                                        <p className="text-gray-600 mb-3">{board.description}</p>
                                    )}
                                    <BoardMetaInfo board={board} />
                                    <BoardTags tags={board.tags} />
                                </div>
                                <div className="flex items-center gap-3">
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
                                                                // setShowEditBoardModal(true);
                                                                setShowSettingsDropdown(false);
                                                            }}
                                                        >
                                                            Teams
                                                        </button>
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

                    {/* Columns Container - Takes remaining space */}
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full">
                            <div className="container mx-auto px-6 py-8 h-full">
                                <div className="flex gap-8 overflow-x-auto h-full pb-4">
                                    {board.columns && board.columns.length > 0 ? (
                                        board.columns.map((column, index) => (
                                            <div
                                                key={column._id}
                                                className={`
                                                    column-wrapper flex-shrink-0 w-80 h-full
                                                    transition-all duration-200
                                                    ${draggedOver === index ? 'transform scale-[1.02] bg-blue-50/50 rounded-lg shadow-lg' : ''}
                                                `}
                                                onDragOver={(e) => handleColumnDragOver(e, index)}
                                                onDragLeave={handleColumnDragLeave}
                                                onDrop={(e) => handleColumnDrop(e, index)}
                                            >
                                                <Column
                                                    column={column}
                                                    boardId={id}
                                                    onColumnUpdated={handleColumnUpdated}
                                                    onColumnDeleted={handleColumnDeleted}
                                                    columnIndex={index}
                                                    onColumnDragStart={(e) => handleColumnDragStart(e, column, index)}
                                                    onColumnDragEnd={handleColumnDragEnd}
                                                    allColumns={board.columns}
                                                    onAllColumnsUpdated={handleAllColumnsUpdated}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-gray-400 mb-4">
                                                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No columns yet</h3>
                                                <p className="text-gray-500 mb-6">Add your first column to start organizing tasks</p>
                                                <button
                                                    onClick={handleAddColumn}
                                                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    Add First Column
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <TeamModal
                isOpen={false}
                onClose={() => { }}
                boardId={id}
                teams={board?.members || []}
            />

            <EditBoardModal
                isOpen={showEditBoardModal}
                onClose={() => setShowEditBoardModal(false)}
                board={board}
                onBoardUpdated={handleBoardUpdate}
            />

            <RemoveBoardModal
                isOpen={showRemoveBoardModal}
                onClose={() => setShowRemoveBoardModal(false)}
                boardId={board?._id}
            />

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