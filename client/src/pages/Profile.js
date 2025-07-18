import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import ProfileForm from "../components/ProfileManagement/ProfileForm";
import CredentialForm from "../components/ProfileManagement/CredentialForm";

function Profile() {
	const [profile, setProfile] = useState(
		{
			firstName: "",
			lastName: "",
			phoneNumber: "",
			avatar: null,
		}
	);
	const [credentials, setCredentials] = useState(
		{
			email: "",
			password: "",
			confirmPassword: "",
		}
	);

	return (
		<Layout>
			<h1>Profile Page</h1>
			<ProfileForm 
				profile={profile} 
				setProfile={setProfile}
			/>
			<CredentialForm 
				credentials={credentials}
				setCredentials={setCredentials}
			/>
			{/* <DeleteAccountForm /> */}
		</Layout>
	);
}

export default Profile;