import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { Home } from './screens/Home';
import { Gigs } from './screens/Gigs';
import { GigDetail } from './screens/GigDetail';
import { Pay } from './screens/Pay';
import { Planning } from './screens/Planning';
import { TimeOff } from './screens/TimeOff';
import { Owner } from './screens/Owner';
import { SignIn } from './screens/SignIn';
import './styles.css';

function App() {
  const { loading, error, me } = useApp();
  if (loading) return <p className="empty" style={{ padding: 24 }}>Loading…</p>;
  if (error) return <p className="empty" style={{ padding: 24 }}>Couldn't load your gigs: {error}</p>;
  if (!me) return <SignIn />;
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gigs" element={<Gigs />} />
      <Route path="/gigs/:id" element={<GigDetail />} />
      <Route path="/pay" element={<Pay />} />
      <Route path="/planning" element={<Planning />} />
      <Route path="/time-off" element={<TimeOff />} />
      <Route path="/owner" element={<Owner />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
  </StrictMode>,
);
