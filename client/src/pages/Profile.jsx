import { useState } from "react";
import Layout from "../components/Layout/Layout";
import ProfileForm from "../components/ProfileManagement/ProfileForm";
import CredentialForm from "../components/ProfileManagement/CredentialForm";
import AccountDeactivation from "../components/ProfileManagement/AccountDeactivation";

function Profile() {
	const [profile, setProfile] = useState(
		{
			firstName: "",
			lastName: "",
			displayName: "",
			avatar: null,
		}
	);
	const [credentials, setCredentials] = useState(
		{
			email: "",
			password: "",
			phoneNumber: "",
			confirmPassword: "",
		}
	);

	return (
		<Layout>
			<div className="flex flex-col md:flex-row justify-center gap-20 mx-auto p-4 md:max-w-5xl">
				<div className="w-full">
					<ProfileForm
						profile={profile}
						setProfile={setProfile}
					/>
				</div>
				<div className="w-full">
					<CredentialForm
						credentials={credentials}
						setCredentials={setCredentials}
					/>
				</div>
			</div>
			<div className="text-xl p-4 mb-4 md:max-w-5xl mx-auto">
				<AccountDeactivation />
			</div>
		</Layout>
	);
}

export default Profile;