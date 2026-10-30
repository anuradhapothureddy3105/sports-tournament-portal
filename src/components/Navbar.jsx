import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/teams", label: "Teams" },
  { to: "/players", label: "Players" },
  { to: "/matches", label: "Matches" },
  { to: "/results", label: "Results" },
];

export default function Navbar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">Tournament Desk</span>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"} className="nav-link">
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
