// Shows loading / error / empty states for list pages.
export default function Status({ loading, error, empty, emptyText, onRetry }) {
  if (loading) return <p className="notice">Loading data from the server…</p>;
  if (error) {
    return (
      <div className="notice notice-error">
        <p>{error}</p>
        <p className="muted">Make sure JSON Server is running on port 3000 (npm run server).</p>
        {onRetry && (
          <button className="btn" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }
  if (empty) return <p className="notice">{emptyText}</p>;
  return null;
}
