import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactSortable } from 'react-sortablejs';
import { boardService } from '../services/boardService';
import AddColumnModal from '../components/Column/AddColumnModal.jsx';
import Column from '../components/Column/Column.jsx';
import BoardTags from '../components/Board/BoardTags.jsx';
import BoardMetaInfo from '../components/Board/BoardMetaInfo.jsx';
import BackToDashboard from '../components/Board/BackToDashboard.jsx';
import EditBoardModal from '../components/Board/EditBoardModal.jsx';
import RemoveBoardModal from '../components/Board/RemoveBoardModal.jsx';

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
    
    // Local columns state for sortable
    const [columns, setColumns] = useState([]);
    
    // Animation state to prevent interactions during animations
    const [isAnimating, setIsAnimating] = useState(false);

    const fetchBoard = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await boardService.getBoardById(id);
            setBoard(response.data);
            setColumns(response.data.columns || []);
        } catch (error) {
            setError(true);
            console.error('Error fetching board:', error);
            if (error.response?.status === 404 || error.response?.status === 403) {
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    // Update local columns when board columns change
    useEffect(() => {
        if (board?.columns) {
            setColumns(board.columns);
        }
    }, [board?.columns]);

    useEffect(() => {
        if (id) {
            fetchBoard();
        }
    }, [id, fetchBoard]);

    const handleBoardUpdate = (updatedBoard) => {
        setBoard(updatedBoard);
    };

    const handleAddColumn = () => {
        setShowAddColumnModal(true);
    };

    const handleColumnCreated = (newColumn) => {
        const updatedColumns = [...columns, newColumn];
        setColumns(updatedColumns);
        setBoard(prev => ({
            ...prev,
            columns: updatedColumns
        }));
    };

    const handleColumnUpdated = (updatedColumn) => {
        const updatedColumns = columns.map(col =>
            col._id === updatedColumn._id ? updatedColumn : col
        );
        setColumns(updatedColumns);
        setBoard(prev => ({
            ...prev,
            columns: updatedColumns
        }));
    };

    const handleColumnDeleted = (deletedColumnId) => {
        const updatedColumns = columns.filter(col => col._id !== deletedColumnId);
        setColumns(updatedColumns);
        setBoard(prev => ({
            ...prev,
            columns: updatedColumns
        }));
    };

    // Handler for updating all columns at once (used for task moves between columns)
    const handleAllColumnsUpdated = (updatedColumns) => {
        setColumns(updatedColumns);
        setBoard(prev => ({
            ...prev,
            columns: updatedColumns
        }));
    };

    // Handle when ReactSortable wants to move/reorder elements (preview)
    const handleMove = () => {
        if (isAnimating) {
            // Force the ghost class to stay
            setTimeout(() => {
                const ghostElement = document.querySelector('.column-sortable-chosen');
                if (ghostElement) {
                    ghostElement.classList.add('column-sortable-ghost');
                }
            }, 10);
            return false; // Returning false prevents the move
        }
        
        // Allow the move and set animation lock
        setIsAnimating(true);
        
        // Clear the lock after animation completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 150); // Shorter timeout
        
        return true; // Allow the move
    };

    // Handle column reordering with ReactSortable (called on every movement)
    const handleColumnSort = (newColumns) => {
        // Only update local state for smooth UI during drag
        setColumns(newColumns);
        setBoard(prev => ({
            ...prev,
            columns: newColumns
        }));
    };

    // Handle the final drop event
    const handleColumnEnd = async (evt) => {
        const { oldIndex, newIndex, item } = evt;
        
        if (oldIndex === newIndex || oldIndex === undefined || newIndex === undefined) {
            return;
        }

        // Get the new order by manually reordering the array
        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(oldIndex, 1);
        newColumns.splice(newIndex, 0, movedColumn);
        const apiPayload = newColumns.map(col => col._id);

        try {
            const result = await boardService.updateColumnOrder(id, apiPayload);
            
            if (result.data.columns) {
                setColumns(result.data.columns);
                setBoard(prev => ({
                    ...prev,
                    columns: result.data.columns
                }));
            }
            
        } catch (error) {
            console.error('Error reordering columns:', error);
            fetchBoard();
            alert('Failed to reorder columns. Please try again.');
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
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
                                {columns && columns.length > 0 ? (
                                    <ReactSortable
                                        list={columns}
                                        setList={handleColumnSort}
                                        group="columns"
                                        animation={200}
                                        delay={0}
                                        delayOnTouchStart={true}
                                        ghostClass="column-sortable-ghost"
                                        chosenClass="column-sortable-chosen"
                                        dragClass="column-sortable-drag"
                                        direction="horizontal"
                                        onMove={handleMove}
                                        onEnd={handleColumnEnd}
                                        className="flex gap-8 overflow-x-auto h-full pb-4"
                                        style={{ minHeight: '100%' }}
                                    >
                                        {columns.map((column, index) => (
                                            <div
                                                key={column._id}
                                                className="column-wrapper flex-shrink-0 w-80 h-full cursor-move"
                                            >
                                                <Column
                                                    column={column}
                                                    boardId={id}
                                                    onColumnUpdated={handleColumnUpdated}
                                                    onColumnDeleted={handleColumnDeleted}
                                                    columnIndex={index}
                                                    allColumns={columns}
                                                    onAllColumnsUpdated={handleAllColumnsUpdated}
                                                />
                                            </div>
                                        ))}
                                    </ReactSortable>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center h-full">
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
                </>
            )}

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

            {/* Add CSS for column sortable styling */}
            <style>
                {`
                .column-sortable-ghost {
                    opacity: 0.4;
                    background: #f3f4f6;
                    border: 2px dashed #3b82f6;
                    border-radius: 8px;
                }
                
                .column-sortable-chosen {
                    cursor: grabbing !important;
                }
                
                .column-sortable-drag {
                    opacity: 0.8;
                    transform: rotate(2deg);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
                    border: 2px solid #3b82f6;
                    z-index: 9999;
                }
                `}
            </style>
        </div>
    );
}

export default Board;