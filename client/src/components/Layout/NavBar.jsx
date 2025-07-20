import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export function NavBar() {
	const [open, setOpen] = useState(false);
	const location = useLocation();

	return (
		<nav>
			<div className="flex justify-between items-center p-4 mb-6 bg-background text-white relative">
				<div>
					<h1>DevBoard</h1>
				</div>

				<button
					className="md:hidden block cursor-pointer"
					onClick={() => setOpen(!open)}
					aria-label="Toggle menu"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				<ul className={`flex-col space-x-0 pb-4 pt-4 absolute bg-background left-0 top-14.5 
								md:flex-row md:flex md:space-x-4 md:static w-full md:w-auto md:top-auto 
								${open ? "flex" : "hidden"} md:items-center md:bg-transparent md:pb-0 md:pt-0`
				}>
					<li>
						<Link
							className={`hover:text-gray-400 block px-4 py-2 ${location.pathname === "/dashboard" ? "text-active-primary" : ""
								}`}
							to="/dashboard"
						>
							Dashboard
						</Link>
					</li>
					<li>
						<Link
							className={`hover:text-gray-400 block px-4 py-2 ${location.pathname === "/profile" ? "text-active-primary" : ""
								}`}
							to="/profile"
						>
							Profile
						</Link>
					</li>
					<li>
						<Link
							className={`hover:text-gray-400 block px-4 py-2 ${location.pathname === "/logout" ? "text-active-primary" : ""
								}`}
							to="/logout"
						>
							Logout
						</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
}