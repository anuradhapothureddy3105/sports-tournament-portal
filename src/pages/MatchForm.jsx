import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Field from "../components/Field.jsx";
import { matchesApi, teamsApi, tournamentsApi } from "../services/api.js";
import { sameId } from "../utils.js";

const empty = { tournamentId: "", homeTeamId: "", awayTeamId: "", date: "", time: "", venue: "", status: "Scheduled" };

export default function MatchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teamsApi.getAll().then(setTeams).catch((err) => setApiError(err.message));
    tournamentsApi.getAll().then(setTournaments).catch((err) => setApiError(err.message));
    if (id) matchesApi.getById(id).then(setForm).catch((err) => setApiError(err.message));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Changing the tournament clears team picks, since teams belong to one tournament.
  const handleTournamentChange = (e) =>
    setForm({ ...form, tournamentId: e.target.value, homeTeamId: "", awayTeamId: "" });

  const tournamentTeams = teams.filter((t) => sameId(t.tournamentId, form.tournamentId));

  const validate = () => {
    const found = {};
    if (!form.tournamentId) found.tournamentId = "Choose a tournament.";
    if (!form.homeTeamId) found.homeTeamId = "Choose the home team.";
    if (!form.awayTeamId) found.awayTeamId = "Choose the away team.";
    if (form.homeTeamId && sameId(form.homeTeamId, form.awayTeamId)) found.awayTeamId = "A team cannot play itself.";
    if (!form.date) found.date = "Choose a match date.";
    if (!form.time) found.time = "Choose a start time.";
    if (!form.venue.trim()) found.venue = "Enter the venue.";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    try {
      setSaving(true);
      if (id) await matchesApi.update(id, form);
      else await matchesApi.create({ ...form, status: "Scheduled" });
      navigate("/matches");
    } catch (err) {
      setApiError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={id ? "Edit match" : "Schedule match"} />
      {apiError && <p className="notice notice-error">{apiError}</p>}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Tournament" error={errors.tournamentId}>
          <select name="tournamentId" value={form.tournamentId} onChange={handleTournamentChange}>
            <option value="">Choose a tournament</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <div className="row">
          <Field label="Home team" error={errors.homeTeamId}>
            <select name="homeTeamId" value={form.homeTeamId} onChange={handleChange} disabled={!form.tournamentId}>
              <option value="">Choose a team</option>
              {tournamentTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Away team" error={errors.awayTeamId}>
            <select name="awayTeamId" value={form.awayTeamId} onChange={handleChange} disabled={!form.tournamentId}>
              <option value="">Choose a team</option>
              {tournamentTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
        </div>
        {form.tournamentId && tournamentTeams.length < 2 && (
          <p className="muted">This tournament needs at least two registered teams before you can schedule a match.</p>
        )}
        <div className="row">
          <Field label="Date" error={errors.date}>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </Field>
          <Field label="Start time" error={errors.time}>
            <input type="time" name="time" value={form.time} onChange={handleChange} />
          </Field>
        </div>
        <Field label="Venue" error={errors.venue}>
          <input name="venue" value={form.venue} onChange={handleChange} />
        </Field>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : id ? "Save changes" : "Schedule match"}
          </button>
          <Link className="btn" to="/matches">Cancel</Link>
        </div>
      </form>
    </>
  );
}
