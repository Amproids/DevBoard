import React from 'react';

const BoardMetaInfo = ({ board }) => {
    const formatDate = dateString => {
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
        return (
            `${board.owner.firstName || ''} ${board.owner.lastName || ''}`.trim() ||
            'Unknown'
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
                <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
                <span>Owner: {getOwnerName()}</span>
            </div>
            <div className="flex items-center">
                <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                </svg>
                <span>{getMemberCount()} members</span>
            </div>
            <div className="flex items-center">
                <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a4 4 0 118 0v4m-4 0a8 8 0 110 16m0-16V4"
                    />
                </svg>
                <span>Created {formatDate(board.createdAt)}</span>
            </div>
            {board.lockedColumns && (
                <div className="flex items-center text-amber-600">
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <span>Columns Locked</span>
                </div>
            )}
        </div>
    );
};

export default BoardMetaInfo;
