import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication token not found');
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const boardService = {
    // Get all boards with optional filters
    async getBoards(params = {}) {
        try {
            const response = await axios.get(`${API_BASE_URL}/boards`, {
                ...getAuthHeaders(),
                params // This will handle filter, sort, search query params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching boards:', error);
            throw error;
        }
    },

    // Get single board by ID with populated columns/tasks
    async getBoardById(boardId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/boards/${boardId}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching board:', error);
            throw error;
        }
    },

    // Create a new board
    async createBoard(boardData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/boards`,
                boardData,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error creating board:', error);
            throw error;
        }
    },

    // Update a board
    async updateBoard(boardId, boardData) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/boards/${boardId}`,
                boardData,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error updating board:', error);
            throw error;
        }
    },

    // Delete a board
    async deleteBoard(boardId) {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/boards/${boardId}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting board:', error);
            throw error;
        }
    },

    // Update column order from dragging
    async updateColumnOrder(boardId, columnIds) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/boards/${boardId}/column-order`,
                { columnIds },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error updating column order:', error);
            throw error;
        }
    }
};
