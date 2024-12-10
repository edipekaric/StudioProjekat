import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App'; // Ensure App contains the router
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
});

test('User login and redirect to LandingStudent', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ token: 'dummy-token' }));

  render(<App />); // Ensure the App component contains the router and handles routes correctly

  const emailInput = screen.getByPlaceholderText(/email/i);
  const passwordInput = screen.getByPlaceholderText(/password/i);
  const loginButton = screen.getByRole('button', { name: /login/i }); // Adjust to match exact button text

  fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(loginButton);

  await waitFor(() => {
    expect(screen.getByText(/filters to search by:/i)).toBeInTheDocument();
  });

  expect(localStorage.getItem('authToken')).toBe('dummy-token');
});
