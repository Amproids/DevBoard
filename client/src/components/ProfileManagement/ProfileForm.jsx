
function ProfileForm({ profile, setProfile }) {

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
		<div>
			<h2 className="text-xl font-medium mb-4 mt-4 md:mt-16">Profile Management</h2>
			<form onSubmit={handleSubmit}>
				<div className="flex flex-col mb-4">
					<label htmlFor="firstName">First Name</label>
					<input
						type="text"
						id="firstName"
						name="firstName"
						className="border border-gray-300   rounded-lg p-2 focus:outline-none focus:ring-0"
						value={profile.firstName}
						onChange={handleChange}
						placeholder="Enter your first name"
					/>
				</div>
				<div className="flex flex-col mb-4">
					<label htmlFor="lastName">Last Name:</label>
					<input
						type="text"
						id="lastName"
						name="lastName"
						className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
						value={profile.lastName}
						onChange={handleChange}
						placeholder="Enter your last name"
					/>
				</div>

				<div className="flex flex-col mb-4">
					<label htmlFor="lastName">Display Name:</label>
					<input
						type="text"
						id="displayName"
						name="displayName"
						className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
						value={profile.displayName}
						onChange={handleChange}
						placeholder="Enter your display name"
					/>
				</div>

				<div className="flex flex-col mb-4">
					<label htmlFor="avatar">Profile Picture:</label>
					<input
						type="file"
						id="avatar"
						name="avatar"
						className="border border-gray-300 rounded-lg p-2 file:rounded-lg file:bg-[#f3f4f6] focus:outline-none focus:ring-0"
						onChange={handleChange}
						accept="image/*"
					/>
				</div>
				<button
					type="submit"
					className="bg-background cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-background-hover focus:outline-none focus:ring-0"
				>
					Update Profile
				</button>
			</form>
		</div>
	);
}

export default ProfileForm;