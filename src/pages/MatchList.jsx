import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Status from "../components/Status.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { matchesApi, teamsApi, tournamentsApi, resultsApi } from "../services/api.js";
import { confirmDelete, formatDate, nameOf, sameId } from "../utils.js";

export default function MatchList() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [m, t, tr, r] = await Promise.all([matchesApi.getAll(), teamsApi.getAll(), tournamentsApi.getAll(), resultsApi.getAll()]);
      setMatches(m);
      setTeams(t);
      setTournaments(tr);
      setResults(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (match) => {
    if (!confirmDelete("this match and its result")) return;
    try {
      const linked = results.filter((r) => sameId(r.matchId, match.id));
      await Promise.all(linked.map((r) => resultsApi.remove(r.id)));
      await matchesApi.remove(match.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const scoreOf = (matchId) => {
    const result = results.find((r) => sameId(r.matchId, matchId));
    return result ? `${result.homeScore} - ${result.awayScore}` : "-";
  };

  const visible = matches
    .filter((m) => {
      const text = `${nameOf(teams, m.homeTeamId)} ${nameOf(teams, m.awayTeamId)} ${m.venue}`.toLowerCase();
      return (
        text.includes(search.toLowerCase()) &&
        (tournamentFilter === "All" || sameId(m.tournamentId, tournamentFilter)) &&
        (statusFilter === "All" || m.status === statusFilter)
      );
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <>
      <PageHeader title="Matches" subtitle="Schedule fixtures and record results." actionLabel="Schedule match" actionTo="/matches/new" />
      <div className="toolbar">
        <input placeholder="Search by team or venue" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={tournamentFilter} onChange={(e) => setTournamentFilter(e.target.value)}>
          <option value="All">All tournaments</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          <option>Scheduled</option>
          <option>Completed</option>
        </select>
      </div>
      <Status loading={loading} error={error} empty={!loading && !error && visible.length === 0} emptyText="No matches found. Schedule a match between two teams." onRetry={loadData} />
      {!loading && !error && visible.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fixture</th><th>Score</th><th>Tournament</th><th>When</th><th>Venue</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id}>
                  <td className="strong">{nameOf(teams, m.homeTeamId)} vs {nameOf(teams, m.awayTeamId)}</td>
                  <td className="num">{scoreOf(m.id)}</td>
                  <td>{nameOf(tournaments, m.tournamentId)}</td>
                  <td>{formatDate(m.date)}, {m.time}</td>
                  <td>{m.venue}</td>
                  <td><StatusBadge status={m.status} /></td>
                  <td className="actions">
                    {m.status !== "Completed" && (
                      <Link className="btn btn-small btn-accent" to={`/results/new/${m.id}`}>Record result</Link>
                    )}
                    <Link className="btn btn-small" to={`/matches/${m.id}/edit`}>Edit</Link>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(m)}>Delete</button>
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
