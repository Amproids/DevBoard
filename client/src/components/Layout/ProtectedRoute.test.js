import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('ProtectedRoute', () => {
    it('renders children when isAuthenticated is true', () => {
        render(
            <MemoryRouter>
                <ProtectedRoute isAuthenticated={true}>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to /login when isAuthenticated is false', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <ProtectedRoute isAuthenticated={false}>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
