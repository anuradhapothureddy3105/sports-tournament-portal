import { Link } from "react-router-dom";

export default function PageHeader({ title, subtitle, actionLabel, actionTo }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actionLabel && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </header>
  );
}
