import React from "react";
import { NavBar } from "./NavBar";

function Layout({children}) {

	return (
		<>
			<NavBar	/>
			<main>
				{children}
			</main>
			<footer>
				<p>© 2023 DevBoard</p>
			</footer>
		</>
	)
}

export default Layout;