import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import PlayersList from './pages/PlayersList';
import PlayerProfile from './pages/PlayerProfile';
import SetupGame from './pages/SetupGame';
import SetupTournament from './pages/SetupTournament';
import ScoreEntry from './pages/ScoreEntry';
import Results from './pages/Results';
import MatchHistory from './pages/MatchHistory';
import MatchDetails from './pages/MatchDetails';
import TournamentHistory from './pages/TournamentHistory';
import Leaderboard from './pages/Leaderboard';
import Layout from './components/Layout';
import { useThemeStore } from './store/theme.store';

function App() {
  const location = useLocation();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);



  return (
    <Layout>
      <div className="font-sans text-parchment-900 dark:text-parchment-100 h-full w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/players" element={<PlayersList />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/setup" element={<SetupGame />} />
            <Route path="/setup-tournament" element={<SetupTournament />} />
            <Route path="/score" element={<ScoreEntry />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<MatchHistory />} />
            <Route path="/history/:id" element={<MatchDetails />} />
            <Route path="/history/tournament/:id" element={<TournamentHistory />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export default App;
