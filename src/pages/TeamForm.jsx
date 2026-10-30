import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Field from "../components/Field.jsx";
import { getTeam, addTeam, updateTeam, tournamentsApi } from "../services/api.js";

const empty = { name: "", coach: "", city: "", tournamentId: "" };

export default function TeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [tournaments, setTournaments] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tournamentsApi.getAll().then(setTournaments).catch((err) => setApiError(err.message));
    if (id) getTeam(id).then(setForm).catch((err) => setApiError(err.message));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const found = {};
    if (!form.name.trim()) found.name = "Enter the team name.";
    if (!form.coach.trim()) found.coach = "Enter the coach's name.";
    if (!form.city.trim()) found.city = "Enter the city.";
    if (!form.tournamentId) found.tournamentId = "Choose a tournament.";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    try {
      setSaving(true);
      if (id) await updateTeam(id, form);
      else await addTeam(form);
      navigate("/teams");
    } catch (err) {
      setApiError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={id ? "Edit team" : "Register team"} />
      {apiError && <p className="notice notice-error">{apiError}</p>}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Team name" error={errors.name}>
          <input name="name" value={form.name} onChange={handleChange} />
        </Field>
        <Field label="Coach" error={errors.coach}>
          <input name="coach" value={form.coach} onChange={handleChange} />
        </Field>
        <Field label="City" error={errors.city}>
          <input name="city" value={form.city} onChange={handleChange} />
        </Field>
        <Field label="Tournament" error={errors.tournamentId}>
          <select name="tournamentId" value={form.tournamentId} onChange={handleChange}>
            <option value="">Choose a tournament</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : id ? "Save changes" : "Register team"}
          </button>
          <Link className="btn" to="/teams">Cancel</Link>
        </div>
      </form>
    </>
  );
}
