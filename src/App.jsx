import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TournamentList from "./pages/TournamentList.jsx";
import TournamentForm from "./pages/TournamentForm.jsx";
import TeamList from "./pages/TeamList.jsx";
import TeamForm from "./pages/TeamForm.jsx";
import PlayerList from "./pages/PlayerList.jsx";
import PlayerForm from "./pages/PlayerForm.jsx";
import MatchList from "./pages/MatchList.jsx";
import MatchForm from "./pages/MatchForm.jsx";
import ResultList from "./pages/ResultList.jsx";
import ResultForm from "./pages/ResultForm.jsx";

export default function App() {
  return (
    <div className="shell">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournaments/new" element={<TournamentForm />} />
          <Route path="/tournaments/:id/edit" element={<TournamentForm />} />
          <Route path="/teams" element={<TeamList />} />
          <Route path="/teams/new" element={<TeamForm />} />
          <Route path="/teams/:id/edit" element={<TeamForm />} />
          <Route path="/players" element={<PlayerList />} />
          <Route path="/players/new" element={<PlayerForm />} />
          <Route path="/players/:id/edit" element={<PlayerForm />} />
          <Route path="/matches" element={<MatchList />} />
          <Route path="/matches/new" element={<MatchForm />} />
          <Route path="/matches/:id/edit" element={<MatchForm />} />
          <Route path="/results" element={<ResultList />} />
          <Route path="/results/new" element={<ResultForm />} />
          <Route path="/results/new/:matchId" element={<ResultForm />} />
          <Route path="/results/:id/edit" element={<ResultForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
