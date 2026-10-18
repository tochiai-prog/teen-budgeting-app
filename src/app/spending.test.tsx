import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './page';

type TestEntry = {
  id: string;
  amount: number;
  date: string;
  category: string;
  merchant: string;
  note: string;
};

function getPastDate(yearsAgo: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function jsonResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

function mockEntriesApi() {
  let nextId = 1;
  const entriesByName = new Map<string, TestEntry[]>();
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const displayName = url.searchParams.get('displayName') ?? '';
    const entries = entriesByName.get(displayName) ?? [];
    const method = init?.method ?? 'GET';

    if (method === 'GET') {
      return jsonResponse({ entries, total: totalOf(entries) });
    }

    if (method === 'POST') {
      const inputEntry = JSON.parse(String(init?.body)) as Omit<TestEntry, 'id'>;
      const entry = { ...inputEntry, id: String(nextId++) };
      const updated = [...entries, entry];
      entriesByName.set(displayName, updated);
      return jsonResponse({ entry, total: totalOf(updated) });
    }

    const id = url.pathname.split('/').at(-1);
    const index = entries.findIndex((entry) => entry.id === id);
    if (method === 'PATCH') {
      const changes = JSON.parse(String(init?.body)) as Omit<TestEntry, 'id'>;
      const updated = entries.map((entry) => entry.id === id ? { ...entry, ...changes } : entry);
      entriesByName.set(displayName, updated);
      return jsonResponse({ entry: updated[index], total: totalOf(updated) });
    }

    const updated = entries.filter((entry) => entry.id !== id);
    entriesByName.set(displayName, updated);
    return jsonResponse({ total: totalOf(updated) });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function totalOf(entries: TestEntry[]) {
  const cents = entries.reduce((total, entry) => total + Math.round(entry.amount * 100), 0);
  return cents / 100;
}

async function finishOnboarding(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/birth date/i), getPastDate(13));
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await user.type(screen.getByLabelText(/display name or nickname/i), 'Maya');
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await user.click(screen.getByLabelText(/educational use only/i));
  await user.click(screen.getByRole('button', { name: /continue/i }));
}

describe('R-05 spending entries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves an entry with optional merchant and note and shows it in history', async () => {
    mockEntriesApi();
    const user = userEvent.setup();
    render(<Home />);
    await finishOnboarding(user);

    await user.type(screen.getByLabelText(/amount/i), '12.5');
    await user.type(screen.getByLabelText(/^date$/i), '2026-10-17');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Rides');
    await user.type(screen.getByLabelText(/merchant/i), 'Metro');
    await user.type(screen.getByLabelText(/note/i), 'Trip to school');
    await user.click(screen.getByRole('button', { name: /add entry/i }));

    const entry = await screen.findByText('Metro');
    expect(within(entry.closest('li') as HTMLElement).getByText('$12.50')).toBeInTheDocument();
    expect(within(entry.closest('li') as HTMLElement).getByText('2026-10-17')).toBeInTheDocument();
    expect(within(entry.closest('li') as HTMLElement).getByText('Rides')).toBeInTheDocument();
    expect(screen.getByText('Trip to school')).toBeInTheDocument();
    expect(screen.getByText('$12.50', { selector: '[data-testid="spending-total"]' })).toBeInTheDocument();
    expect(
      within(screen.getByLabelText(/category/i)).getAllByRole('option').map((option) => option.textContent),
    ).toEqual(["Choose a category", "Rides", "Shopping", "Food delivery", "Entertainment", "Other"]);
  });

  it('allows an entry without a merchant or note', async () => {
    mockEntriesApi();
    const user = userEvent.setup();
    render(<Home />);
    await finishOnboarding(user);

    await user.type(screen.getByLabelText(/amount/i), '5');
    await user.type(screen.getByLabelText(/^date$/i), '2026-10-17');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Other');
    await user.click(screen.getByRole('button', { name: /add entry/i }));

    const history = screen.getByRole('list', { name: /spending history/i });
    expect(await within(history).findByText('Other')).toBeInTheDocument();
    expect(screen.getByText('$5.00', { selector: '[data-testid="spending-total"]' })).toBeInTheDocument();
  });

  it('edits every field of its own entry and updates the overall total', async () => {
    mockEntriesApi();
    const user = userEvent.setup();
    render(<Home />);
    await finishOnboarding(user);

    await user.type(screen.getByLabelText(/amount/i), '12.5');
    await user.type(screen.getByLabelText(/^date$/i), '2026-10-17');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Rides');
    await user.type(screen.getByLabelText(/merchant/i), 'Metro');
    await user.type(screen.getByLabelText(/note/i), 'Trip to school');
    await user.click(screen.getByRole('button', { name: /add entry/i }));
    await screen.findByText('Metro');
    await user.click(screen.getByRole('button', { name: /edit entry/i }));

    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.clear(screen.getByLabelText(/^date$/i));
    await user.type(screen.getByLabelText(/^date$/i), '2026-10-16');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Shopping');
    await user.clear(screen.getByLabelText(/merchant/i));
    await user.type(screen.getByLabelText(/merchant/i), 'Bookshop');
    await user.clear(screen.getByLabelText(/note/i));
    await user.type(screen.getByLabelText(/note/i), 'Notebook');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Bookshop')).toBeInTheDocument();
    expect(screen.getByText('Notebook')).toBeInTheDocument();
    const history = screen.getByRole('list', { name: /spending history/i });
    expect(within(history).getByText('Shopping')).toBeInTheDocument();
    expect(within(history).getByText('2026-10-16')).toBeInTheDocument();
    expect(screen.getByText('$20.00', { selector: '[data-testid="spending-total"]' })).toBeInTheDocument();
  });

  it('deletes its own entry and updates the overall total', async () => {
    mockEntriesApi();
    const user = userEvent.setup();
    render(<Home />);
    await finishOnboarding(user);

    for (const [amount, merchant] of [['12.5', 'Metro'], ['5', 'Snack Shop']]) {
      await user.type(screen.getByLabelText(/amount/i), amount);
      await user.type(screen.getByLabelText(/^date$/i), '2026-10-17');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Other');
      await user.type(screen.getByLabelText(/merchant/i), merchant);
      await user.click(screen.getByRole('button', { name: /add entry/i }));
      await screen.findByText(merchant);
    }

    const history = screen.getByRole('list', { name: /spending history/i });
    const metroEntry = within(history).getByText('Metro').closest('li');
    expect(metroEntry).not.toBeNull();
    await user.click(within(metroEntry as HTMLElement).getByRole('button', { name: /delete entry/i }));

    expect(await within(history).queryByText('Metro')).not.toBeInTheDocument();
    expect(within(history).getByText('Snack Shop')).toBeInTheDocument();
    expect(screen.getByText('$5.00', { selector: '[data-testid="spending-total"]' })).toBeInTheDocument();
  });
});
