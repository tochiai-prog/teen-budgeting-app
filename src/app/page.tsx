"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { spendingEntryCategories } from "@/lib/spendingEntryValidation";
import styles from "./page.module.css";

type Step = "welcome" | "name" | "confirm" | "complete" | "blocked";

type SpendingEntry = {
  id: string;
  amount: number;
  date: string;
  category: string;
  merchant: string;
  note: string;
};

type EntryFields = Omit<SpendingEntry, "id">;

type EntryForm = {
  amount: string;
  date: string;
  category: string;
  merchant: string;
  note: string;
};

type EntriesResponse = {
  entries: SpendingEntry[];
  total: number;
  message?: string;
};

type EntryResponse = {
  entry: SpendingEntry;
  total: number;
  message?: string;
};

type TotalResponse = {
  total: number;
  message?: string;
};

const emptyForm: EntryForm = {
  amount: "",
  date: "",
  category: "",
  merchant: "",
  note: "",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

async function readResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const result = await response.json() as T & { message?: string };
  if (!response.ok) {
    throw new Error(result.message ?? fallbackMessage);
  }
  return result;
}

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;

  const today = new Date();
  const dob = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(dob.getTime())) return null;

  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  const dayDifference = today.getDate() - dob.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age -= 1;
  }

  return age;
}

export default function Home() {
  const [step, setStep] = useState<Step>("welcome");
  const [birthDate, setBirthDate] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isEducationalUseConfirmed, setIsEducationalUseConfirmed] = useState(false);
  const [entries, setEntries] = useState<SpendingEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const age = useMemo(() => calculateAge(birthDate), [birthDate]);
  const isEligible = age !== null && age >= 13 && age <= 19;
  const entriesUrl = `/api/entries?displayName=${encodeURIComponent(displayName.trim())}`;

  useEffect(() => {
    if (step !== "complete") return;

    let isCurrent = true;

    async function loadEntries() {
      try {
        const response = await fetch(entriesUrl);
        const result = await readResponse<EntriesResponse>(
          response,
          "Could not load spending entries.",
        );
        if (isCurrent) {
          setEntries(result.entries);
          setTotal(result.total);
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load spending entries.");
        }
      }
    }

    void loadEntries();
    return () => {
      isCurrent = false;
    };
  }, [entriesUrl, step]);

  const handleContinueFromWelcome = () => {
    if (!birthDate) return;

    if (!isEligible) {
      setStep("blocked");
      return;
    }

    setStep("name");
  };

  const handleBackToWelcome = () => {
    setStep("welcome");
    setBirthDate("");
    setDisplayName("");
    setIsEducationalUseConfirmed(false);
  };

  const handleContinueFromName = () => {
    if (!displayName.trim()) return;
    setStep("confirm");
  };

  const handleFinish = () => {
    if (!isEducationalUseConfirmed) return;
    setStep("complete");
  };

  const handleSaveEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    const fields: EntryFields = {
      amount: Number(form.amount),
      date: form.date,
      category: form.category,
      merchant: form.merchant.trim(),
      note: form.note.trim(),
    };
    const url = editingId
      ? `/api/entries/${encodeURIComponent(editingId)}?displayName=${encodeURIComponent(displayName.trim())}`
      : entriesUrl;

    try {
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = await readResponse<EntryResponse>(
        response,
        "Could not save the entry.",
      );

      setEntries((current) => editingId
        ? current.map((entry) => entry.id === result.entry.id ? result.entry : entry)
        : [...current, result.entry]);
      setTotal(result.total);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save the entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (entry: SpendingEntry) => {
    setEditingId(entry.id);
    setForm({
      amount: entry.amount.toFixed(2),
      date: entry.date,
      category: entry.category,
      merchant: entry.merchant,
      note: entry.note,
    });
    setErrorMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMessage("");
  };

  const handleDelete = async (id: string) => {
    setErrorMessage("");
    setIsSaving(true);
    try {
      const url = `/api/entries/${encodeURIComponent(id)}?displayName=${encodeURIComponent(displayName.trim())}`;
      const response = await fetch(url, { method: "DELETE" });
      const result = await readResponse<TotalResponse>(
        response,
        "Could not delete the entry.",
      );
      setEntries((current) => current.filter((entry) => entry.id !== id));
      setTotal(result.total);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete the entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Teen budgeting demo</p>

          {step === "welcome" && (
            <>
              <h1>Welcome</h1>
              <p className={styles.subtitle}>
                This prototype is for educational use. After confirming your age, you can
                enter your spending by hand using a display name.
              </p>

              <label className={styles.field} htmlFor="birth-date">
                <span>Birth date</span>
                <input
                  id="birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </label>

              <div className={styles.notice}>
                Spending entries are kept in server memory and reset on every deploy.
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleContinueFromWelcome}
                disabled={!birthDate}
              >
                Continue
              </button>
            </>
          )}

          {step === "blocked" && (
            <>
              <h1>Age requirement</h1>
              <p className={styles.errorMessage}>
                You must be at least 13 to use this app.
              </p>
              <p className={styles.subtitle}>
                This prototype is intended for ages 13–19 only.
              </p>

              <button type="button" className={styles.secondaryButton} onClick={handleBackToWelcome}>
                Exit
              </button>
            </>
          )}

          {step === "name" && (
            <>
              <h1>Almost ready</h1>
              <p className={styles.subtitle}>Choose a display name or nickname.</p>

              <label className={styles.field} htmlFor="display-name">
                <span>Display name or nickname</span>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Maya"
                />
              </label>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleContinueFromName}
                disabled={!displayName.trim()}
              >
                Continue
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <h1>Educational use only</h1>
              <p className={styles.subtitle}>Please confirm before continuing.</p>

              <label className={styles.checkboxRow} htmlFor="educational-use-confirmation">
                <input
                  id="educational-use-confirmation"
                  type="checkbox"
                  checked={isEducationalUseConfirmed}
                  onChange={(event) => setIsEducationalUseConfirmed(event.target.checked)}
                />
                <span>I understand this app is for educational use only</span>
              </label>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleFinish}
                disabled={!isEducationalUseConfirmed}
              >
                Continue
              </button>
            </>
          )}

          {step === "complete" && (
            <>
              <h1>Welcome, {displayName.trim()}!</h1>
              <p className={styles.subtitle}>
                Enter your spending manually. Your entries are associated with the display
                name you typed; this prototype does not provide a private account.
              </p>

              <div className={styles.notice}>
                Entries are stored in server memory only and reset on every deploy.
                Anyone using the same display name will see the same entries.
              </div>

              <section aria-labelledby="spending-total-heading">
                <h2 id="spending-total-heading" className={styles.sectionHeading}>
                  Total spending
                </h2>
                <p className={styles.total} data-testid="spending-total">
                  {formatCurrency(total)}
                </p>
              </section>

              <form className={styles.entryForm} onSubmit={handleSaveEntry}>
                <h2 className={styles.sectionHeading}>
                  {editingId ? "Edit entry" : "Add spending entry"}
                </h2>

                <label className={styles.field} htmlFor="entry-amount">
                  <span>Amount (USD)</span>
                  <input
                    id="entry-amount"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  />
                </label>

                <label className={styles.field} htmlFor="entry-date">
                  <span>Date</span>
                  <input
                    id="entry-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                  />
                </label>

                <label className={styles.field} htmlFor="entry-category">
                  <span>Category</span>
                  <select
                    id="entry-category"
                    required
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  >
                    <option value="">Choose a category</option>
                    {spendingEntryCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className={styles.field} htmlFor="entry-merchant">
                  <span>Merchant (optional)</span>
                  <input
                    id="entry-merchant"
                    type="text"
                    value={form.merchant}
                    onChange={(event) => setForm({ ...form, merchant: event.target.value })}
                  />
                </label>

                <label className={styles.field} htmlFor="entry-note">
                  <span>Note (optional)</span>
                  <input
                    id="entry-note"
                    type="text"
                    value={form.note}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                  />
                </label>

                <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                  {editingId ? "Save changes" : "Add entry"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel edit
                  </button>
                )}
              </form>

              {errorMessage && <p className={styles.errorMessage} role="alert">{errorMessage}</p>}

              <section className={styles.history} aria-labelledby="history-heading">
                <h2 id="history-heading" className={styles.sectionHeading}>Spending history</h2>
                {entries.length === 0 ? (
                  <p>No spending entries yet.</p>
                ) : (
                  <ul className={styles.entryList} aria-label="Spending history">
                    {entries.map((entry) => (
                      <li className={styles.entry} key={entry.id}>
                        <div className={styles.entryDetails}>
                          <strong>{entry.merchant || entry.category}</strong>
                          <span>{entry.date}</span>
                          {entry.merchant && <span>{entry.category}</span>}
                          {entry.note && <span>{entry.note}</span>}
                          <span>{formatCurrency(entry.amount)}</span>
                        </div>
                        <div className={styles.entryActions}>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => handleEdit(entry)}
                            disabled={isSaving}
                            aria-label="Edit entry"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => void handleDelete(entry.id)}
                            disabled={isSaving}
                            aria-label="Delete entry"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
