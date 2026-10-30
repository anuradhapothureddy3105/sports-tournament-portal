import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Status from "../components/Status.jsx";
import { getTeams, deleteTeam, tournamentsApi, playersApi } from "../services/api.js";
import { confirmDelete, nameOf, sameId } from "../utils.js";

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [teamData, tournamentData, playerData] = await Promise.all([getTeams(), tournamentsApi.getAll(), playersApi.getAll()]);
      setTeams(teamData);
      setTournaments(tournamentData);
      setPlayers(playerData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (team) => {
    if (!confirmDelete(`team "${team.name}"`)) return;
    try {
      await deleteTeam(team.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = teams.filter((t) => {
    const text = `${t.name} ${t.coach} ${t.city}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (tournamentFilter === "All" || sameId(t.tournamentId, tournamentFilter));
  });

  return (
    <>
      <PageHeader title="Teams" subtitle="Register teams and assign them to tournaments." actionLabel="Register team" actionTo="/teams/new" />
      <div className="toolbar">
        <input placeholder="Search by team, coach or city" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={tournamentFilter} onChange={(e) => setTournamentFilter(e.target.value)}>
          <option value="All">All tournaments</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <Status loading={loading} error={error} empty={!loading && !error && visible.length === 0} emptyText="No teams found. Register a team to begin." onRetry={loadData} />
      {!loading && !error && visible.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Team</th><th>Coach</th><th>City</th><th>Tournament</th><th>Players</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td className="strong">{t.name}</td>
                  <td>{t.coach}</td>
                  <td>{t.city}</td>
                  <td>{nameOf(tournaments, t.tournamentId)}</td>
                  <td>{players.filter((p) => sameId(p.teamId, t.id)).length}</td>
                  <td className="actions">
                    <Link className="btn btn-small" to={`/teams/${t.id}/edit`}>Edit</Link>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(t)}>Delete</button>
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
