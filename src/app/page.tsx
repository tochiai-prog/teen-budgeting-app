"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type Step = "welcome" | "name" | "confirm" | "complete" | "blocked";

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

  const age = useMemo(() => calculateAge(birthDate), [birthDate]);

  const isEligible = age !== null && age >= 13 && age <= 19;

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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Teen budgeting demo</p>

          {step === "welcome" && (
            <>
              <h1>Welcome</h1>
              <p className={styles.subtitle}>
                This prototype is for educational use only. We will only check your age and you can start with a display name.
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
                Prototype note: this demo keeps data only in memory while the app is running. It resets when the server restarts or the app is redeployed.
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
              <h1>Welcome, {displayName.trim() || "friend"}!</h1>
              <p className={styles.subtitle}>
                Your onboarding is complete. This is a sample educational prototype with simulated information.
              </p>
              <div className={styles.notice}>
                No real account, authentication, or financial data is used in this demo.
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
