import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Field from "../components/Field.jsx";
import { matchesApi, resultsApi, teamsApi } from "../services/api.js";
import { nameOf, sameId } from "../utils.js";

const empty = { matchId: "", homeScore: "", awayScore: "", notes: "" };

export default function ResultForm() {
  const { id, matchId } = useParams(); // id = editing a result, matchId = preselected match
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...empty, matchId: matchId || "" });
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teamsApi.getAll().then(setTeams).catch((err) => setApiError(err.message));
    matchesApi.getAll().then(setMatches).catch((err) => setApiError(err.message));
    if (id) resultsApi.getById(id).then(setForm).catch((err) => setApiError(err.message));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // New results can only be recorded for matches that are not completed yet.
  const selectable = matches.filter((m) => m.status !== "Completed" || sameId(m.id, form.matchId));
  const match = matches.find((m) => sameId(m.id, form.matchId));
  const label = (m) => `${nameOf(teams, m.homeTeamId)} vs ${nameOf(teams, m.awayTeamId)} (${m.date})`;

  const validate = () => {
    const found = {};
    if (!form.matchId) found.matchId = "Choose the match.";
    if (form.homeScore === "" || Number(form.homeScore) < 0) found.homeScore = "Enter the home score (0 or more).";
    if (form.awayScore === "" || Number(form.awayScore) < 0) found.awayScore = "Enter the away score (0 or more).";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const home = Number(form.homeScore);
    const away = Number(form.awayScore);
    let winnerId = "draw";
    if (home > away) winnerId = match.homeTeamId;
    if (away > home) winnerId = match.awayTeamId;
    const payload = { matchId: form.matchId, homeScore: home, awayScore: away, winnerId, notes: form.notes.trim() };

    try {
      setSaving(true);
      if (id) await resultsApi.update(id, payload);
      else await resultsApi.create(payload);
      // Recording a result completes the match.
      if (match.status !== "Completed") await matchesApi.update(match.id, { ...match, status: "Completed" });
      navigate("/results");
    } catch (err) {
      setApiError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={id ? "Edit result" : "Record result"} subtitle="Saving a result marks the match as completed." />
      {apiError && <p className="notice notice-error">{apiError}</p>}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Match" error={errors.matchId}>
          <select name="matchId" value={form.matchId} onChange={handleChange} disabled={Boolean(id)}>
            <option value="">Choose a match</option>
            {selectable.map((m) => (
              <option key={m.id} value={m.id}>{label(m)}</option>
            ))}
          </select>
        </Field>
        {match && (
          <div className="row">
            <Field label={`${nameOf(teams, match.homeTeamId)} (home) score`} error={errors.homeScore}>
              <input type="number" min="0" name="homeScore" value={form.homeScore} onChange={handleChange} />
            </Field>
            <Field label={`${nameOf(teams, match.awayTeamId)} (away) score`} error={errors.awayScore}>
              <input type="number" min="0" name="awayScore" value={form.awayScore} onChange={handleChange} />
            </Field>
          </div>
        )}
        <Field label="Match notes (optional)">
          <textarea name="notes" rows="3" value={form.notes} onChange={handleChange} />
        </Field>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving || !match}>
            {saving ? "Saving…" : id ? "Save changes" : "Save result"}
          </button>
          <Link className="btn" to="/results">Cancel</Link>
        </div>
      </form>
    </>
  );
}
