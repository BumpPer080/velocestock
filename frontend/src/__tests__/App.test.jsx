import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { role: 'admin', username: 'tester' },
    isInitializing: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

describe('App', () => {
  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('สินค้า')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('รายงาน')).length).toBeGreaterThan(0);
  });
});
