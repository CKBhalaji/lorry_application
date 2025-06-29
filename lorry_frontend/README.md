# Lorry Application Frontend

This is the React frontend for the Lorry logistics platform.

## Features
- Modern, responsive UI
- User registration and login (Driver, Goods Owner, Admin)
- Dashboard for each user type
- Load posting, bidding, and management
- Dispute management
- Light/dark theme support

## Folder Structure
```
lorry_frontend/
├── public/
├── src/
│   ├── Pages/           # Main pages (Home, Register, Login, etc.)
│   ├── components/      # Reusable components (Navbar, Footer, Dashboard, etc.)
│   ├── context/         # React context (AuthContext)
│   ├── services/        # API service functions
│   ├── assets/          # Images and static assets
│   ├── index.js(x)      # Entry point
│   └── App.jsx          # Main router and layout
├── package.json
└── ...
```

## How to Run
```sh
cd lorry_frontend
npm install
npm start
```
- The app will run at `http://localhost:3000`.

## Key Files
- `src/Pages/Home.jsx` — Home page
- `src/Pages/RegisterChoice.jsx` — Register as Driver or Goods Owner
- `src/components/driver/DriverDashboard.jsx` — Driver dashboard
- `src/components/goods-owner/GODashboard.jsx` — Goods Owner dashboard
- `src/components/common/ProtectedRoute.jsx` — Route protection logic
- `src/context/AuthContext.jsx` — Authentication context
- `src/services/` — API calls to backend

## Theming
- All colors and themes are managed with CSS variables in `Navbar.css` and other CSS files.

## API
- The frontend communicates with the FastAPI backend (see backend README).
- API endpoints are configured in the service files in `src/services/`.

## Contribution
- Please follow the existing folder structure and use functional components with hooks.
- Use CSS modules or scoped CSS for styling.
