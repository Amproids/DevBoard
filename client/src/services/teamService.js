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

export const teamService = {
	async inviteMember(boardId, memberData) {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/invitations/${boardId}/invite`,
				memberData,
				getAuthHeaders()
			);
			return response.data;
		} catch (error) {
			console.error('Error inviting member:', error);
			throw error;
		}
	},

	// Remove a member from the team
	async removeMember(boardId, updatedData) {
		try {
			const response = await axios.put(
				`${API_BASE_URL}/boards/${boardId}`,
				updatedData,
				getAuthHeaders()
			);
			return response.data;
		} catch (error) {
			console.error('Error removing member:', error);
			throw error;
		}
	},

	// Assign owner to the team
	async assignOwner(teamId, memberId) {
		try {
			const response = await axios.patch(
				`${API_BASE_URL}/teams/${teamId}/owner`,
				{ memberId },
				getAuthHeaders()
			);
			return response.data;
		} catch (error) {
			console.error('Error assigning owner:', error);
			throw error;
		}
	},

	// Edit a member's role in the team
	async editRole(teamId, memberId, role) {
		try {
			const response = await axios.patch(
				`${API_BASE_URL}/teams/${teamId}/members/${memberId}/role`,
				{ role },
				getAuthHeaders()
			);
			return response.data;
		} catch (error) {
			console.error('Error editing role:', error);
			throw error;
		}
	},

	// Verify invitation token
	async verifyInvitation(token) {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/invitations/${token}/verify`
			);
			return response.data;
		} catch (error) {
			console.error('Error verifying invitation:', error);
			throw error;
		}
	},

	// Accept an invitation
	async acceptInvitation(token) {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/invitations/${token}/accept`,
				{},
				getAuthHeaders()
			);
			return response.data;
		} catch (error) {
			console.error('Error accepting invitation:', error);
			throw error;
		}
	}
};