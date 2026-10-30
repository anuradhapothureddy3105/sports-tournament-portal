// API service layer: all communication with JSON Server lives here.
const BASE_URL = "http://localhost:3000";

const request = async (path, options) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return response.json();
};

const withBody = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Builds GET all / GET by id / POST / PUT / DELETE for any resource.
const createCrud = (resource) => ({
  getAll: () => request(`/${resource}`),
  getById: (id) => request(`/${resource}/${id}`),
  create: (data) => request(`/${resource}`, withBody("POST", data)),
  update: (id, data) => request(`/${resource}/${id}`, withBody("PUT", data)),
  remove: (id) => request(`/${resource}/${id}`, { method: "DELETE" }),
});

export const tournamentsApi = createCrud("tournaments");
export const teamsApi = createCrud("teams");
export const playersApi = createCrud("players");
export const matchesApi = createCrud("matches");
export const resultsApi = createCrud("results");

// Explicit named helpers for the main entity (teams).
export const getTeams = () => teamsApi.getAll();
export const getTeam = (id) => teamsApi.getById(id);
export const addTeam = (team) => teamsApi.create(team);
export const updateTeam = (id, team) => teamsApi.update(id, team);
export const deleteTeam = (id) => teamsApi.remove(id);
