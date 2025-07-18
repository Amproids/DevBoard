

function CredentialForm({ credentials, setCredentials }) {

	const handleChange = (event) => {
		const { name, value } = event.target;
		setCredentials((prevCredentials) => ({
			...prevCredentials,
			[name]: value,
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		console.log("Credentials submitted:", credentials);
	};

	return (
		<div className="CredentialForm">
			<h2>Credential Management</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="email">Email:</label>
					<input 
						type="email" 
						id="email" 
						name="email"
						value={credentials.email}
						onChange={handleChange}
						placeholder="Enter your email"
					/>
				</div>
				<div>
					<label htmlFor="password">Password:</label>
					<input 
						type="password" 
						id="password" 
						name="password"
						value={credentials.password}
						onChange={handleChange}
						placeholder="Enter your password"
					/>
				</div>
				<div>
					<label htmlFor="confirmPassword">Confirm Password:</label>
					<input 
						type="password" 
						id="confirmPassword" 
						name="confirmPassword"
						value={credentials.confirmPassword}
						onChange={handleChange}
						placeholder="Confirm your password"
					/>
				</div>
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}

export default CredentialForm;