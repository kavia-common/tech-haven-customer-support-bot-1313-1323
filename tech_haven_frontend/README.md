# Tech Haven Frontend (React)

Customer-facing web UI to submit questions and receive instant answers from the Q&A agent.

## Quick Start

1) Install dependencies
   npm install

2) Start the app
   npm start

The app runs on http://localhost:3000.

## Backend API URL

The frontend calls the backend at:
- Default: https://vscode-internal-36968-beta.beta01.cloud.kavia.ai:3001
- Or set an environment variable for local/remote backends:
  REACT_APP_BACKEND_URL=https://your-backend-host:port

For Create React App, set it before starting:
REACT_APP_BACKEND_URL=http://localhost:3001 npm start

## Features implemented

- Q&A form with validation and loading state
- Calls POST /api/ask and displays formatted answers
- Fetches and shows knowledge base from GET /api/knowledge-base
- Dark/light theme toggle
- Accessible and responsive UI

## Notes on CORS

Ensure the backend enables CORS for the frontend origin (http://localhost:3000 in development). If using a different backend URL, set REACT_APP_BACKEND_URL accordingly.
