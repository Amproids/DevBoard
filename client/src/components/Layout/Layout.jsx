import React from "react";
import { NavBar } from "./NavBar";

function Layout({ children }) {

	return (
		<>
			<NavBar />
			<main>
				{children}
			</main>
			<footer className=" text-right p-4 mt-8">
				<p>© 2023 DevBoard</p>
			</footer>
		</>
	)
}

export default Layout;