# Tournament Desk: Sports Tournament Management Portal

A React + JSON Server capstone. Administrators can create tournaments, register teams, manage players, schedule matches and record results.

## Tech stack
React 18, React Router 6, Vite, JSON Server 0.17, Fetch API

## Getting started
```bash
npm install
npm start
```
`npm start` runs both servers:
- React app: http://localhost:5173
- JSON Server API: http://localhost:3000

To run them separately: `npm run server` and `npm run dev` in two terminals.

## Features
- CRUD for tournaments, teams, players, matches and results
- Search and filters on every list
- Form validation (required fields, date order, unique jersey number per team, team cannot play itself)
- Recording a result marks the match Completed; deleting it reopens the match
- Dashboard: totals, goals scored, points table per tournament (win 3, draw 1), next matches, latest results

## API endpoints (http://localhost:3000)
| Resource | Endpoints |
|---|---|
| tournaments, teams, players, matches, results | `GET /resource`, `GET /resource/:id`, `POST /resource`, `PUT /resource/:id`, `DELETE /resource/:id` |

## Project structure
```
db.json                  JSON Server database
src/services/api.js      API service layer (fetch)
src/components/          Navbar, PageHeader, Field, Status, StatusBadge
src/pages/               Dashboard and list/form pages per resource
```

## React data flow
Page opens -> `useEffect` -> `services/api.js` -> `fetch` -> JSON Server -> `setState` -> re-render.
Create/update: form `useState` -> validation -> POST/PUT -> navigate to list. Edit loads data with `useParams` + GET by id. Delete asks for confirmation, calls DELETE, then reloads the list.

## Push to GitHub
```bash
git init
git add .
git commit -m "Sports Tournament Management Portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
