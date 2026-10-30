import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Status from "../components/Status.jsx";
import { matchesApi, playersApi, resultsApi, teamsApi, tournamentsApi } from "../services/api.js";
import { formatDate, nameOf, sameId } from "../utils.js";

export default function Dashboard() {
  const [data, setData] = useState({ tournaments: [], teams: [], players: [], matches: [], results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tournaments, teams, players, matches, results] = await Promise.all([
        tournamentsApi.getAll(), teamsApi.getAll(), playersApi.getAll(), matchesApi.getAll(), resultsApi.getAll(),
      ]);
      setData({ tournaments, teams, players, matches, results });
      if (tournaments.length > 0) setSelected((current) => current || String(tournaments[0].id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { tournaments, teams, players, matches, results } = data;

  const totalGoals = results.reduce((sum, r) => sum + Number(r.homeScore) + Number(r.awayScore), 0);
  const upcoming = matches.filter((m) => m.status !== "Completed").sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const recent = results.slice(-4).reverse();

  // Points table for the selected tournament: win 3, draw 1, loss 0.
  const standings = useMemo(() => {
    const table = teams
      .filter((t) => sameId(t.tournamentId, selected))
      .map((t) => ({ id: t.id, name: t.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }));
    results.forEach((result) => {
      const match = matches.find((m) => sameId(m.id, result.matchId));
      if (!match || !sameId(match.tournamentId, selected)) return;
      const home = table.find((row) => sameId(row.id, match.homeTeamId));
      const away = table.find((row) => sameId(row.id, match.awayTeamId));
      if (!home || !away) return;
      const hs = Number(result.homeScore);
      const as = Number(result.awayScore);
      home.played++; away.played++;
      home.gf += hs; home.ga += as;
      away.gf += as; away.ga += hs;
      if (hs > as) { home.won++; home.points += 3; away.lost++; }
      else if (as > hs) { away.won++; away.points += 3; home.lost++; }
      else { home.drawn++; away.drawn++; home.points++; away.points++; }
    });
    return table.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
  }, [teams, matches, results, selected]);

  const stats = [
    { label: "Tournaments", value: tournaments.length, to: "/tournaments" },
    { label: "Teams", value: teams.length, to: "/teams" },
    { label: "Players", value: players.length, to: "/players" },
    { label: "Matches to play", value: upcoming.length, to: "/matches" },
    { label: "Goals scored", value: totalGoals, to: "/results" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live view of every tournament." />
      <Status loading={loading} error={error} onRetry={loadData} />
      {!loading && !error && (
        <>
          <section className="stat-strip">
            {stats.map((s) => (
              <Link key={s.label} to={s.to} className="stat">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </Link>
            ))}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Points table</h2>
              <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {standings.length === 0 ? (
              <p className="notice">No teams are registered in this tournament yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>
                  </thead>
                  <tbody>
                    {standings.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td className="strong">{row.name}</td>
                        <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td>
                        <td>{row.gf}</td><td>{row.ga}</td><td>{row.gf - row.ga}</td>
                        <td className="num">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="two-col">
            <section className="panel">
              <h2>Next matches</h2>
              {upcoming.length === 0 ? (
                <p className="notice">Nothing scheduled. <Link to="/matches/new">Schedule a match</Link>.</p>
              ) : (
                <ul className="plain-list">
                  {upcoming.slice(0, 5).map((m) => (
                    <li key={m.id}>
                      <span className="strong">{nameOf(teams, m.homeTeamId)} vs {nameOf(teams, m.awayTeamId)}</span>
                      <span className="muted">{formatDate(m.date)}, {m.time} at {m.venue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="panel">
              <h2>Latest results</h2>
              {recent.length === 0 ? (
                <p className="notice">No results recorded yet.</p>
              ) : (
                <ul className="plain-list">
                  {recent.map((r) => {
                    const m = matches.find((x) => sameId(x.id, r.matchId));
                    if (!m) return null;
                    return (
                      <li key={r.id}>
                        <span className="strong">{nameOf(teams, m.homeTeamId)} {r.homeScore} - {r.awayScore} {nameOf(teams, m.awayTeamId)}</span>
                        <span className="muted">{formatDate(m.date)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
