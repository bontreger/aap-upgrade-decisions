import { Route, Routes, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { WizardProvider } from './context/WizardContext';
import { AppLayout } from './components/AppLayout';
import { WizardPage } from './pages/WizardPage';
import { ReportPage } from './pages/ReportPage';

export function App() {
  return (
    <SettingsProvider>
      <WizardProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<WizardPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </WizardProvider>
    </SettingsProvider>
  );
}
