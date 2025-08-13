import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamService } from '../services/teamService';

const AcceptInvitation = () => {
	const { token } = useParams();
	const [status, setStatus] = useState('idle');
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			alert('Invalid invitation token');
			navigate('/login');
		}
		const acceptInvitation = async () => {
			try {
				const verifyResponse = await teamService.verifyInvitation(token);
				if (!verifyResponse.success) {
					throw new Error(verifyResponse.message || 'Invalid invitation token');
				}
				const response = await teamService.acceptInvitation(token);
				if (!response.success) {
					throw new Error(response.message || 'Failed to accept invitation');
				}
				setStatus('accepted');
				setTimeout(() => {
					navigate(`/dashboard`);
				}, 2000);
			} catch (error) {
				alert(error.message);
				navigate('/');
			}
		}
		acceptInvitation();
	}, [token]);

	return (
		<div style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: 8 }}>
			<h2>Accept Invitation</h2>
			{status === 'idle' && <p>Processing your invitation...</p>}
			{status === 'accepted' &&
				<p className='text-green-500 text-center'>Invitation accepted! Redirecting...</p>}

		</div>
	);
};

export default AcceptInvitation;