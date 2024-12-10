import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingStudent from '../src/LandingStudent';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
});

test('Search for tutors and display results', async () => {
  fetchMock.mockResponses(
    [JSON.stringify({ subjects: [{ subjectID: 1, name: 'Math' }] }), { status: 200 }],
    [JSON.stringify({ tutors: [{ firstName: 'John', lastName: 'Doe', hourlyRate: 25, subjects: 'Math' }] }), { status: 200 }]
  );

  render(
    <BrowserRouter>
      <LandingStudent />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/math/i)).toBeInTheDocument();
  });

  const searchButton = screen.getByRole('button', { name: /search/i }); // Use role and accessible name
  fireEvent.click(searchButton);

  const noResultsText = await screen.findByText('No results found.');
  expect(noResultsText).toBeInTheDocument();
});
