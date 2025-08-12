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

export const columnService = {
    // Get all columns for a board
    async getColumns(boardId, params = {}) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/columns/${boardId}`,
                {
                    ...getAuthHeaders(),
                    params // sort, populateTasks
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching columns:', error);
            throw error;
        }
    },

    // Create a new column
    async createColumn(boardId, columnData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/columns/${boardId}`,
                columnData,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error creating column:', error);
            throw error;
        }
    },

    // Update a column
    async updateColumn(columnId, columnData) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/columns/${columnId}`,
                columnData,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error updating column:', error);
            throw error;
        }
    },

    // Delete a column
    async deleteColumn(columnId, deleteOptions) {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/columns/${columnId}`,
                {
                    ...getAuthHeaders(),
                    data: deleteOptions // action for handling tasks
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting column:', error);
            throw error;
        }
    },

    // Lock/unlock a column
    async toggleColumnLock(columnId, isLocked) {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/columns/${columnId}`,
                { isLocked },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error toggling column lock:', error);
            throw error;
        }
    }
};
