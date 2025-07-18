import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavBar } from './NavBar';

describe('NavBar Component', () => {
	test('renders the application title', () => {
		render(
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		);
		const titleElement = screen.getByText("DevBoard");
		expect(titleElement).toBeInTheDocument();
	});

	test('renders the Dashboard link', () => {
		render(
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		);
		const dashboardLink = screen.getByText("Dashboard");
		expect(dashboardLink).toBeInTheDocument();
		expect(dashboardLink).toHaveAttribute('href', '/dashboard');
	});

	test('renders the Profile link', () => {
		render(
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		);
		const profileLink = screen.getByText("Profile");
		expect(profileLink).toBeInTheDocument();
		expect(profileLink).toHaveAttribute('href', '/profile');
	});

	test('renders the Logout link', () => {
		render(
			<MemoryRouter>
				<NavBar />
			</MemoryRouter>
		);
		const logoutLink = screen.getByText("Logout");
		expect(logoutLink).toBeInTheDocument();
		expect(logoutLink).toHaveAttribute('href', '/logout');
	});
});