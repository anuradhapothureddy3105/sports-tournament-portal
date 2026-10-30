import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Status from "../components/Status.jsx";
import { playersApi, teamsApi } from "../services/api.js";
import { confirmDelete, nameOf, sameId } from "../utils.js";

export default function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [playerData, teamData] = await Promise.all([playersApi.getAll(), teamsApi.getAll()]);
      setPlayers(playerData);
      setTeams(teamData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (player) => {
    if (!confirmDelete(`player "${player.name}"`)) return;
    try {
      await playersApi.remove(player.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = players.filter((p) => {
    const text = `${p.name} ${p.position}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (teamFilter === "All" || sameId(p.teamId, teamFilter));
  });

  return (
    <>
      <PageHeader title="Players" subtitle="Manage the squad for every team." actionLabel="Add player" actionTo="/players/new" />
      <div className="toolbar">
        <input placeholder="Search by player or position" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="All">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <Status loading={loading} error={error} empty={!loading && !error && visible.length === 0} emptyText="No players found. Add a player to a team." onRetry={loadData} />
      {!loading && !error && visible.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Jersey</th><th>Player</th><th>Age</th><th>Position</th><th>Team</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.jerseyNo}</td>
                  <td className="strong">{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.position}</td>
                  <td>{nameOf(teams, p.teamId)}</td>
                  <td className="actions">
                    <Link className="btn btn-small" to={`/players/${p.id}/edit`}>Edit</Link>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(p)}>Delete</button>
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
