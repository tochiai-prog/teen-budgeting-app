import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './page';

function getPastDate(yearsAgo: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return date.toISOString().slice(0, 10);
}

describe('story 1 age-gate onboarding', () => {
  it('rejects users under 13 and shows a friendly message with an exit option', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const birthDateInput = screen.getByLabelText(/birth date/i);
    await user.clear(birthDateInput);
    await user.type(birthDateInput, getPastDate(12));

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/you must be at least 13 to use this app/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exit/i })).toBeInTheDocument();
  });

  it('allows users aged 13 to 19 to continue through the onboarding flow', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const birthDateInput = screen.getByLabelText(/birth date/i);
    await user.clear(birthDateInput);
    await user.type(birthDateInput, getPastDate(13));

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByLabelText(/display name or nickname/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/display name or nickname/i), 'Maya');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    const confirmation = screen.getByLabelText(/i understand this app is for educational use only/i);
    expect(confirmation).not.toBeChecked();

    await user.click(confirmation);
    expect(confirmation).toBeChecked();
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
  });
});
