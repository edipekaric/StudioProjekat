import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingStudent from '../src/LandingStudent';

beforeEach(() => {
  fetch.resetMocks();
});

test('searchButtonCallsHandleSearch', async () => {
  fetch.mockResponseOnce(JSON.stringify({ tutors: [] }));

  render(
    <BrowserRouter>
      <LandingStudent />
    </BrowserRouter>
  );

  const searchButton = screen.getByText('Search');
  fireEvent.click(searchButton);

  const noResultsText = await screen.findByText('No results found.');
  expect(noResultsText).toBeInTheDocument();
});

//searchButtonCallsHandleSearch