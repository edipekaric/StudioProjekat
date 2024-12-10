import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingStudent from '../src/LandingStudent';
import { act } from '@testing-library/react';

test('rendersFiltersHeaderCorrectly', async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <LandingStudent />
      </BrowserRouter>
    );
  });

  const headerElement = screen.getByText(/Filters to search by:/i);
  expect(headerElement).toBeInTheDocument();
});


//rendersFiltersHeaderCorrectly