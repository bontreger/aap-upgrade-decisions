import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { EMPTY_ANSWERS, type WizardAnswers } from '../types/wizard';

const STORAGE_KEY = 'aap-upgrade-wizard-answers';

interface WizardState {
  answers: WizardAnswers;
  setAnswers: (updater: (prev: WizardAnswers) => WizardAnswers) => void;
  resetAnswers: () => void;
}

const WizardContext = createContext<WizardState | null>(null);

function loadAnswers(): WizardAnswers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY_ANSWERS, ...JSON.parse(raw) } as WizardAnswers;
  } catch {
    /* noop */
  }
  return { ...EMPTY_ANSWERS };
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswersRaw] = useState<WizardAnswers>(loadAnswers);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* noop */
    }
  }, [answers]);

  const setAnswers = useCallback((updater: (prev: WizardAnswers) => WizardAnswers) => {
    setAnswersRaw((prev) => updater(prev));
  }, []);

  const resetAnswers = useCallback(() => {
    setAnswersRaw({ ...EMPTY_ANSWERS });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  return (
    <WizardContext.Provider value={{ answers, setAnswers, resetAnswers }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardState {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside WizardProvider');
  return ctx;
}
