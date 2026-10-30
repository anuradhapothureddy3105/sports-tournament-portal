import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Status from "../components/Status.jsx";
import { matchesApi, resultsApi, teamsApi, tournamentsApi } from "../services/api.js";
import { confirmDelete, formatDate, nameOf, sameId } from "../utils.js";

export default function ResultList() {
  const [results, setResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [r, m, t, tr] = await Promise.all([resultsApi.getAll(), matchesApi.getAll(), teamsApi.getAll(), tournamentsApi.getAll()]);
      setResults(r);
      setMatches(m);
      setTeams(t);
      setTournaments(tr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const matchOf = (result) => matches.find((m) => sameId(m.id, result.matchId));

  const handleDelete = async (result) => {
    if (!confirmDelete("this result")) return;
    try {
      await resultsApi.remove(result.id);
      const match = matchOf(result);
      // Removing the result reopens the match.
      if (match) await matchesApi.update(match.id, { ...match, status: "Scheduled" });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const rows = results
    .map((r) => ({ result: r, match: matchOf(r) }))
    .filter(({ match }) => match)
    .filter(({ match }) => {
      const text = `${nameOf(teams, match.homeTeamId)} ${nameOf(teams, match.awayTeamId)}`.toLowerCase();
      return text.includes(search.toLowerCase()) && (tournamentFilter === "All" || sameId(match.tournamentId, tournamentFilter));
    });

  const winnerLabel = (result) => (result.winnerId === "draw" ? "Draw" : nameOf(teams, result.winnerId));

  return (
    <>
      <PageHeader title="Results" subtitle="Scores for completed matches." actionLabel="Record result" actionTo="/results/new" />
      <div className="toolbar">
        <input placeholder="Search by team" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={tournamentFilter} onChange={(e) => setTournamentFilter(e.target.value)}>
          <option value="All">All tournaments</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <Status loading={loading} error={error} empty={!loading && !error && rows.length === 0} emptyText="No results yet. Record one after a match is played." onRetry={loadData} />
      {!loading && !error && rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Match</th><th>Score</th><th>Winner</th><th>Date</th><th>Notes</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(({ result, match }) => (
                <tr key={result.id}>
                  <td className="strong">{nameOf(teams, match.homeTeamId)} vs {nameOf(teams, match.awayTeamId)}</td>
                  <td className="num">{result.homeScore} - {result.awayScore}</td>
                  <td>{winnerLabel(result)}</td>
                  <td>{formatDate(match.date)}</td>
                  <td>{result.notes || "-"}</td>
                  <td className="actions">
                    <Link className="btn btn-small" to={`/results/${result.id}/edit`}>Edit</Link>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(result)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
