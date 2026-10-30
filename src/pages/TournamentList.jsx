import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Status from "../components/Status.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { tournamentsApi } from "../services/api.js";
import { confirmDelete, formatDate } from "../utils.js";

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setTournaments(await tournamentsApi.getAll());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (tournament) => {
    if (!confirmDelete(`"${tournament.name}"`)) return;
    try {
      await tournamentsApi.remove(tournament.id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = tournaments.filter((t) => {
    const text = `${t.name} ${t.sport} ${t.venue}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "All" || t.status === statusFilter);
  });

  return (
    <>
      <PageHeader title="Tournaments" subtitle="Create and manage every tournament." actionLabel="Add tournament" actionTo="/tournaments/new" />
      <div className="toolbar">
        <input placeholder="Search by name, sport or venue" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Upcoming</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
      </div>
      <Status loading={loading} error={error} empty={!loading && !error && visible.length === 0} emptyText="No tournaments found. Add one to get started." onRetry={loadData} />
      {!loading && !error && visible.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Sport</th><th>Venue</th><th>Dates</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td className="strong">{t.name}</td>
                  <td>{t.sport}</td>
                  <td>{t.venue}</td>
                  <td>{formatDate(t.startDate)} to {formatDate(t.endDate)}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="actions">
                    <Link className="btn btn-small" to={`/tournaments/${t.id}/edit`}>Edit</Link>
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
