# AI Watch Tower prototype backend

The backend is a dependency-free Node.js HTTP service backed by an on-disk SQLite database. Prompt scans, generated incidents, red-team results, review actions, users, and audit events survive server restarts.

Database file: `server/data/watchtower.db`

## Start the demo

Open two terminals in the project folder.

Terminal 1:

```powershell
npm run server
```

Terminal 2:

```powershell
npm run dev
```

Open the Vite URL shown in Terminal 2 (normally `http://localhost:5173`). The frontend proxies `/api` requests to `http://localhost:4000`.

## API endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `POST /api/inspect` with `{ "prompt": "..." }`
- `GET /api/red-team/tests`
- `POST /api/red-team/test`
- `GET /api/incidents`
- `POST /api/incidents/:id/acknowledge`
- `POST /api/incidents/:id/false-positive`
- `GET /api/audit-log`

Set `VITE_API_URL` when the backend is hosted separately. The backend port can be changed with `PORT`.
