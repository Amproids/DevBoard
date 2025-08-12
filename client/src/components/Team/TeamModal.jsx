import React, { useEffect, useState } from 'react';
import Modal from '../Shared/Modal';
import { teamService } from '../../services/teamService';

const ROLE_OPTIONS = [
	{ value: 'admin', label: 'Admin' },
	{ value: 'editor', label: 'Editor' },
	{ value: 'viewer', label: 'Viewer' }
];

const TeamModal = ({ isOpen, onClose, boardId, board, teams = [], currentUserId, onTeamUpdated }) => {
	const [email, setEmail] = useState('');
	const [role, setRole] = useState('editor');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [menuOpenId, setMenuOpenId] = useState(null);
	const [roleChangeLoading, setRoleChangeLoading] = useState({});
	const [transferLoading, setTransferLoading] = useState({});
	const [removeLoading, setRemoveLoading] = useState({});

	// Find owner
	const owner = teams.find(t => t.role === 'owner');
	const ownerId = owner?.user?._id;

	const handleInputChange = (e) => setEmail(e.target.value);

	const handleInvite = async (e) => {
		e.preventDefault();
		if (!email.trim()) {
			setError('Email is required');
			return;
		}
		try {
			setLoading(true);
			setError('');
			const response = await teamService.inviteMember(boardId, { email: email.trim(), role });
			if (response.success) {
				if (onTeamUpdated) onTeamUpdated();
				setEmail('');
				setRole('editor');
			} else {
				setError(response.message || 'Failed to invite member');
			}
		} catch (error) {
			setError('Failed to invite member');
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveMember = async (memberId) => {
		setRemoveLoading(prev => ({ ...prev, [memberId]: true }));
		try {
			alert("Are you sure you want to remove this member?");
			if (memberId === ownerId) {
				setError('Cannot remove the owner of the team');
				return;
			}
			const updatedData = {
				...board,
				members: teams
					.filter(member => member._id !== memberId)
					.map(member => ({
						...member,
						user: member.user._id
					}))
			};
			await teamService.removeMember(boardId, updatedData);
			if (onTeamUpdated) onTeamUpdated();
		} catch (error) {
			setError('Failed to remove member');
		} finally {
			setRemoveLoading(prev => ({ ...prev, [memberId]: false }));
			setMenuOpenId(null);
		}
	};

	const handleTransferOwnership = async (memberId) => {
		setTransferLoading(prev => ({ ...prev, [memberId]: true }));
		try {
			await teamService.transferOwnership(boardId, memberId);
			if (onTeamUpdated) onTeamUpdated();
		} catch (error) {
			setError('Failed to transfer ownership');
		} finally {
			setTransferLoading(prev => ({ ...prev, [memberId]: false }));
			setMenuOpenId(null);
		}
	};

	const handleChangeRole = async (memberId, newRole) => {
		setRoleChangeLoading(prev => ({ ...prev, [memberId]: true }));
		try {
			await teamService.changeRole(boardId, memberId, newRole);
			if (onTeamUpdated) onTeamUpdated();
		} catch (error) {
			setError('Failed to change role');
		} finally {
			setRoleChangeLoading(prev => ({ ...prev, [memberId]: false }));
			setMenuOpenId(null);
		}
	};

	const handleClose = () => {
		setError('');
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Manage Team">
			<form onSubmit={handleInvite}>
				<div className="mb-4 flex items-center gap-2">
					<input
						type="email"
						value={email}
						onChange={handleInputChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter an email to invite"
						disabled={loading}
						required
						maxLength={50}
					/>
					<select
						value={role}
						onChange={e => setRole(e.target.value)}
						className="px-2 py-2 border border-gray-300 rounded-md"
						disabled={loading}
					>
						{ROLE_OPTIONS.map(opt => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						))}
					</select>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
						disabled={loading}
					>
						{loading ? "Inviting..." : "Invite"}
					</button>
				</div>
				{error && (
					<div className="mb-4 text-red-600 text-sm">
						{error}
					</div>
				)}
			</form>
			<div>
				{teams && teams.length > 0 ? (
					<ul className="divide-y divide-gray-200">
						{teams.map((team) => (
							<li key={team._id} className="py-2 flex items-center justify-between group relative">
								<div className="flex items-center gap-2">
									<span className="font-medium text-gray-800">
										{team.user.firstName} {team.user.lastName}
									</span>
									{team.role === 'owner' && (
										<span className="ml-2 px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800 font-semibold">Owner</span>
									)}
								</div>
								<div className="flex items-center gap-2">
									<select
										value={team.role}
										disabled={team.role === 'owner' || roleChangeLoading[team._id]}
										onChange={e => handleChangeRole(team._id, e.target.value)}
										className="px-2 py-1 border border-gray-300 rounded text-sm"
									>
										{ROLE_OPTIONS.map(opt => (
											<option key={opt.value} value={opt.value}>{opt.label}</option>
										))}
										{team.role === 'owner' && <option value="owner">Owner</option>}
									</select>
									<button
										className="p-1 rounded hover:bg-gray-100 transition-colors"
										onClick={() => setMenuOpenId(menuOpenId === team._id ? null : team._id)}
									>
										<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<circle cx="12" cy="6" r="1.5" />
											<circle cx="12" cy="12" r="1.5" />
											<circle cx="12" cy="18" r="1.5" />
										</svg>
									</button>
									{menuOpenId === team._id && (
										<div className="absolute right-0 top-8 w-44 bg-white rounded-md shadow-lg border z-20">
											<div className="py-1">
												{team.role !== 'owner' && (
													<button
														className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
														onClick={() => handleTransferOwnership(team._id)}
														disabled={transferLoading[team._id]}
													>
														{transferLoading[team._id] ? "Transferring..." : "Transfer Ownership"}
													</button>
												)}
												{team.role !== 'owner' && (
													<button
														className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
														onClick={() => handleRemoveMember(team._id)}
														disabled={removeLoading[team._id]}
													>
														{removeLoading[team._id] ? "Removing..." : "Remove Member"}
													</button>
												)}
												{team.role === 'owner' && (
													<span className="block px-4 py-2 text-xs text-gray-400">Owner cannot be removed</span>
												)}
											</div>
										</div>
									)}
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className="text-gray-500">No team members found.</p>
				)}
			</div>
		</Modal>
	);
};

export default TeamModal;