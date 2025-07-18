
import { Link } from "react-router-dom";

export function NavBar() {
  return (
	<nav>
	  <div>
		<div>
			<h1>DevBoard</h1>
		</div>
		<ul>
			<Link to="/dashboard">Dashboard</Link>
			<Link to="/profile">Profile</Link>
			<Link to="/logout">Logout</Link>
		</ul>
	  </div>
	</nav>
  );
}