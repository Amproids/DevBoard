
function ProfileForm({profile, setProfile}) {

	const handleChange = (event) => {
		const { name, value } = event.target;
		setProfile((prevProfile) => ({
			...prevProfile,
			[name]: value,
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		console.log("Profile submitted:", profile);
	};

	return (
		<div className="ProfileForm">
			<h2>Profile Management</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="firstName">First Name:</label>
					<input 
						type="text" 
						id="firstName" 
						name="firstName"
						value={profile.firstName}
						onChange={handleChange}
						placeholder="Enter your first name"
					/>
				</div>
				<div>
					<label htmlFor="lastName">Last Name:</label>
					<input 
						type="text" 
						id="lastName" 
						name="lastName"
						value={profile.lastName}
						onChange={handleChange}
						placeholder="Enter your last name"
					/>
				</div>
				<div>
					<label htmlFor="phoneNumber">Phone Number:</label>
					<input 
						type="tel" 
						id="phoneNumber" 
						name="phoneNumber"
						value={profile.phoneNumber}
						onChange={handleChange}
						placeholder="Enter your phone number"
					/>
				</div>
				<div>
					<label htmlFor="avatar">Profile Picture:</label>
					<input 
						type="file" 
						id="avatar" 
						name="avatar"
						onChange={handleChange}
						accept="image/*"
					/>
				</div>
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}

export default ProfileForm;