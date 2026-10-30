// Small helpers shared by pages.
export const sameId = (a, b) => String(a) === String(b);

export const nameOf = (list, id, fallback = "Unknown") =>
  list.find((item) => sameId(item.id, id))?.name ?? fallback;

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const confirmDelete = (what) =>
  window.confirm(`Delete ${what}? This cannot be undone.`);
