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

export const taskService = {
    // Create a new task in a column
    async createTask(columnId, taskData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/tasks/${columnId}`, taskData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // Get all tasks in a column
    async getColumnTasks(columnId, params = {}) {
        try {
            const response = await axios.get(`${API_BASE_URL}/tasks/${columnId}/tasks`, {
                ...getAuthHeaders(),
                params // filter, sort, priority, search
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching column tasks:', error);
            throw error;
        }
    },

    // Get detailed task information
    async getTaskDetails(taskId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error fetching task details:', error);
            throw error;
        }
    },

    // Update a task
    async updateTask(taskId, taskData) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, taskData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Delete a task
    async deleteTask(taskId) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Move a task to another column or reorder within the same column
    async moveTask(taskId, moveData) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}/move`, moveData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error moving task:', error);
            throw error;
        }
    },

    // Assign a user to a task
    async assignTask(taskId, assignmentData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/assign`, assignmentData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error assigning task:', error);
            throw error;
        }
    },

    // Remove user assignment from a task
    async removeAssignment(taskId, userId) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}/assign/${userId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error removing assignment:', error);
            throw error;
        }
    }
};