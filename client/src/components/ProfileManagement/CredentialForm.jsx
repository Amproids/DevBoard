import axios from "axios";
import { useState } from "react";


function CredentialForm({ credentials, setCredentials }) {

	const [status, setStatus] = useState({
		success: false,
		message: "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setCredentials((prevCredentials) => ({
			...prevCredentials,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		try {
			event.preventDefault();
			setStatus({
				success: false,
				message: "",
			});
			setLoading(true);
			if (credentials.password !== credentials.confirmPassword) {
				throw { 
					response: 
					{ data: 
						{ message: "Passwords do not match" } 
					} 
				};
			}
			const response = await axios.put(
				"http://localhost:3000/credentials",
				credentials,
				{
					headers: {
						Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N2NmOTllZDhjMTRiMmQ1ZTk3MWNiNyIsImVtYWlsIjoiZXhhbXBsaUBleGFtcGxlLmNvbSIsImlhdCI6MTc1MzAzOTA3OSwiZXhwIjoxNzUzMDQyNjc5fQ.EOnMrWp3Gbr5BnQQUe2Nivrh1lUxujkximUujDTx47o`,
					},
				}
			);
			setStatus({
				success: true,
				message: "Credentials updated successfully",
			});
		} catch (error) {
			console.error("Error updating profile:", error);
			setStatus({
				success: false,
				message: error.response?.data?.message || "An error occurred!",
			});
		} finally {
			setTimeout(() => {
				setStatus({
					success: false,
					message: "",
				});
			}, 5000);
			setLoading(false);
		}
	};

	return (
		<div>
			<h2 className="text-xl font-medium mb-4 mt-4 md:mt-16">Credential Management</h2>
			<form onSubmit={handleSubmit}>
				<div className="flex flex-col mb-4">
					<label htmlFor="email">Email<span className="p-1 text-red-500">*</span></label>
					<input
						type="email"
						id="email"
						className="border border-gray-300  rounded-lg p-2 focus:outline-none focus:ring-0"
						name="email"
						value={credentials.email}
						onChange={handleChange}
						placeholder="Enter your email"
						required
					/>
				</div>
				<div className="flex flex-col mb-4">
					<label htmlFor="phoneNumber">Phone Number</label>
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
					<label htmlFor="password">Password <span className="p-1 text-red-500">*</span></label>
					<input
						type="password"
						id="password"
						className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
						name="password"
						value={credentials.password}
						onChange={handleChange}
						placeholder="Enter your password"
						required
						minLength={6}
					/>
				</div>
				<div className="flex flex-col mb-4">
					<label htmlFor="confirmPassword">Confirm Password <span className="p-1 text-red-500">*</span></label>
					<input
						type="password"
						id="confirmPassword"
						className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
						name="confirmPassword"
						value={credentials.confirmPassword}
						onChange={handleChange}
						placeholder="Confirm your password"
						required
						minLength={6}
					/>
				</div>
				<button
					className="bg-background cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-background-hover focus:outline-none focus:ring-0"
					type="submit"
				>
					{loading ? "Updating..." : "Update Credentials"}
				</button>
				<div className="mt-4">
					{status.success && (
						<p className="text-green-500">{status.message}</p>
					)}
					{!status.success && (
						<p className="text-red-500">{status.message}</p>
					)}
				</div>
			</form>
		</div>
	);
}

export default CredentialForm;