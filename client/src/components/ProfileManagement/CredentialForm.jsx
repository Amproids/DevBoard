

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
		<div>
			<h2 className="text-xl font-medium mb-4 mt-4 md:mt-16">Credential Management</h2>
			<form onSubmit={handleSubmit}>
				<div className="flex flex-col mb-4">
					<label htmlFor="email">Email:</label>
					<input
						type="email"
						id="email"
						className="border border-gray-300  rounded-lg p-2 focus:outline-none focus:ring-0"
						name="email"
						value={credentials.email}
						onChange={handleChange}
						placeholder="Enter your email"
					/>
				</div>
				<div className="flex flex-col mb-4">
					<label htmlFor="phoneNumber">Phone Number:</label>
					<input
						type="tel"
						id="phoneNumber"
						name="phoneNumber"
						className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
						value={credentials.phoneNumber}
						onChange={handleChange}
						placeholder="Enter your phone number"
					/>
				</div>
				<div className="flex flex-col mb-4">
					<label htmlFor="password">Password:</label>
					<input
						type="password"
						id="password"
						className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
						name="password"
						value={credentials.password}
						onChange={handleChange}
						placeholder="Enter your password"
					/>
				</div>
				<div className="flex flex-col mb-4">
					<label htmlFor="confirmPassword">Confirm Password:</label>
					<input
						type="password"
						id="confirmPassword"
						className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
						name="confirmPassword"
						value={credentials.confirmPassword}
						onChange={handleChange}
						placeholder="Confirm your password"
					/>
				</div>
				<button
					className="bg-background cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-background-hover focus:outline-none focus:ring-0"
					type="submit"
				>
					Update Credentials
				</button>
			</form>
		</div>
	);
}

export default CredentialForm;