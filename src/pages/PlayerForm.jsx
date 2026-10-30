import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Field from "../components/Field.jsx";
import { playersApi, teamsApi } from "../services/api.js";
import { sameId } from "../utils.js";

const empty = { name: "", age: "", position: "", jerseyNo: "", teamId: "" };

export default function PlayerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teamsApi.getAll().then(setTeams).catch((err) => setApiError(err.message));
    playersApi.getAll().then(setPlayers).catch((err) => setApiError(err.message));
    if (id) playersApi.getById(id).then(setForm).catch((err) => setApiError(err.message));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const found = {};
    const age = Number(form.age);
    const jersey = Number(form.jerseyNo);
    if (!form.name.trim()) found.name = "Enter the player's name.";
    if (!form.age || age < 10 || age > 60) found.age = "Enter an age between 10 and 60.";
    if (!form.position.trim()) found.position = "Enter the playing position.";
    if (!form.jerseyNo || jersey < 1 || jersey > 99) found.jerseyNo = "Enter a jersey number from 1 to 99.";
    if (!form.teamId) found.teamId = "Choose a team.";
    const clash = players.some((p) => !sameId(p.id, id) && sameId(p.teamId, form.teamId) && Number(p.jerseyNo) === jersey);
    if (form.teamId && jersey && clash) found.jerseyNo = "Another player on this team already wears that number.";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const payload = { ...form, age: Number(form.age), jerseyNo: Number(form.jerseyNo) };
    try {
      setSaving(true);
      if (id) await playersApi.update(id, payload);
      else await playersApi.create(payload);
      navigate("/players");
    } catch (err) {
      setApiError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={id ? "Edit player" : "Add player"} />
      {apiError && <p className="notice notice-error">{apiError}</p>}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Player name" error={errors.name}>
          <input name="name" value={form.name} onChange={handleChange} />
        </Field>
        <div className="row">
          <Field label="Age" error={errors.age}>
            <input type="number" name="age" value={form.age} onChange={handleChange} />
          </Field>
          <Field label="Jersey number" error={errors.jerseyNo}>
            <input type="number" name="jerseyNo" value={form.jerseyNo} onChange={handleChange} />
          </Field>
        </div>
        <Field label="Position" error={errors.position}>
          <input name="position" value={form.position} onChange={handleChange} />
        </Field>
        <Field label="Team" error={errors.teamId}>
          <select name="teamId" value={form.teamId} onChange={handleChange}>
            <option value="">Choose a team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : id ? "Save changes" : "Add player"}
          </button>
          <Link className="btn" to="/players">Cancel</Link>
        </div>
      </form>
    </>
  );
}
