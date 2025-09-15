import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('renders Tech Haven Support title', () => {
  render(<App />);
  const title = screen.getByText(/Tech Haven Support/i);
  expect(title).toBeInTheDocument();
});
