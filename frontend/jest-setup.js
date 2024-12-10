import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import { TextEncoder, TextDecoder } from 'util';

// Enable fetch mocks globally
fetchMock.enableMocks();

// Define TextEncoder and TextDecoder globally for tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
