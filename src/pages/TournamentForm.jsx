import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Field from "../components/Field.jsx";
import { tournamentsApi } from "../services/api.js";

const empty = { name: "", sport: "", venue: "", startDate: "", endDate: "", status: "Upcoming" };

export default function TournamentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    tournamentsApi.getById(id).then(setForm).catch((err) => setLoadError(err.message));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const found = {};
    if (!form.name.trim()) found.name = "Enter the tournament name.";
    if (!form.sport.trim()) found.sport = "Enter the sport.";
    if (!form.venue.trim()) found.venue = "Enter the venue.";
    if (!form.startDate) found.startDate = "Choose a start date.";
    if (!form.endDate) found.endDate = "Choose an end date.";
    if (form.startDate && form.endDate && form.endDate < form.startDate) found.endDate = "End date must be on or after the start date.";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    try {
      setSaving(true);
      if (id) await tournamentsApi.update(id, form);
      else await tournamentsApi.create(form);
      navigate("/tournaments");
    } catch (err) {
      setLoadError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={id ? "Edit tournament" : "Add tournament"} />
      {loadError && <p className="notice notice-error">{loadError}</p>}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Tournament name" error={errors.name}>
          <input name="name" value={form.name} onChange={handleChange} />
        </Field>
        <Field label="Sport" error={errors.sport}>
          <input name="sport" value={form.sport} onChange={handleChange} />
        </Field>
        <Field label="Venue" error={errors.venue}>
          <input name="venue" value={form.venue} onChange={handleChange} />
        </Field>
        <div className="row">
          <Field label="Start date" error={errors.startDate}>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
          </Field>
          <Field label="End date" error={errors.endDate}>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
          </Field>
        </div>
        <Field label="Status">
          <select name="status" value={form.status} onChange={handleChange}>
            <option>Upcoming</option>
            <option>Ongoing</option>
            <option>Completed</option>
          </select>
        </Field>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : id ? "Save changes" : "Add tournament"}
          </button>
          <Link className="btn" to="/tournaments">Cancel</Link>
        </div>
      </form>
    </>
  );
}
