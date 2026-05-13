# Soccer Planner Next.js App
  - A soccer planner app: manage groups and matches (users create groups, group managers create matches in the groups, group members join matches).
  - Technologies: Next.js + Neon DB + Drizzle ORM + React + Tailwind

# Architectural Guidelines
  - Structure the app business logic in a **service layer**, consumed by the **Server Actions** and the **RESTful API**.
  - Use **modular design**: split your app into self-contained components (e.g. UI pages, UI components, services, route handlers, utils) to improve project maintenance. When reasonable, use separate files for the UI, business logic, and other app assets. Avoid big and complex monolith code.
  - Auth: Use JWT tokens and bcrypt.
  - Database: Always use Drizzle migrations when you want to change the DB schema. Use Drizzle APIs to interact with the DB from the services.

# User Interface
  - Implement modern, user-friendly UI design, with icons, effects, transitions.
  - Implement **responsive design** for desktop and mobile browsers.
  - Use **server-side components in Next.js**, unless a browser interaction is needed.
