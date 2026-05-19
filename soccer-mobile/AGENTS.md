# Soccer Planner Next.js App
  - A soccer planner app: view groups and matches (users login, view groups and matches, join / unjoin matches).
  - Technologies: Expo, React Native, Expo Router
  - Back-end: Soccer Planner RESTful API, with "Bearer token" auth

# Architectural Guidelines
  - Use **modular design**: split the app into self-contained components (e.g. UI pages, UI components, services, route handlers, utils) to improve project maintenance and avoid complex monolith code.
  - RESTful API backend

# Mobile User Interface
  - Implement user-friendly UI design, with stack navigation, with **responsive layout** for tablets and smartphones.

#	Mobile UI Alerts
  - Ensure all native alerts, confirms and other system dialogs have a reliable fallback for Web (implemented as modal popups)

# API Docs
The back-end API documentation is described here: http://localhost:3000/api/docs
