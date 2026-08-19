<img width="1024" height="248" alt="image" src="https://github.com/user-attachments/assets/dc8c6bb1-a1d1-484f-b4ca-2fa17a3f1e1a" />

# Webify.me

Webify.me is a presentation creation platform with a React frontend and backend services for authentication, user management, presentation storage, and admin communication workflows.

## What this project does

- User signup/login and profile management
- Slide and presentation creation workflows
- Saved presentation management (create, view, rename, delete)
- Admin panel operations and user-facing notifications
- Email-based user/admin communication features

## Project structure

```text
webify.me/
├── src/                    # React frontend application
│   ├── Components/
│   │   ├── Introduction/   # Landing page and introduction experience
│   │   ├── LogIn/          # User login flow
│   │   ├── Signup/         # User registration flow
│   │   ├── User/           # Main user workspace/dashboard
│   │   ├── AdminPanel/     # Admin-facing management UI
│   │   └── SlideShow/      # Slideshow-related UI components
│   ├── App.js              # Application routes
│   └── config.js           # Frontend API base configuration
├── Ballerina_backend/      # Ballerina HTTP service + MongoDB integration
├── Python/                 # Flask-based backend script and dependencies
├── public/                 # Static assets
└── package.json            # Frontend scripts and dependencies
```

## Frontend routing

Main routes defined in `src/App.js`:

- `/` → Introduction page
- `/login` → Login page
- `/signup` → Signup page
- `/user` → User dashboard/workspace
- `/adminKingSUSL@NirangaKaveeshaIshanGayathri` → Admin panel

## Backend overview

### Ballerina backend (`Ballerina_backend/main.bal`)

Provides API endpoints for:

- Admin authentication
- User signup/login and username/email checks
- User profile and profile-picture management
- Presentation CRUD operations
- Notifications and notification counters
- Admin messages and broadcast email notification workflows

### Python backend (`Python/Test.py`)

Contains Flask routes and utilities for:

- User/account workflows
- Presentation generation and rendering flows
- Collaboration helpers
- Notification and email helpers

## Getting started

### 1) Frontend

```bash
npm install
npm start
```

Other scripts:

```bash
npm run build
npm test
```

### 2) Backend services

Choose the backend implementation you want to run:

- **Ballerina backend:** run from `Ballerina_backend/` using your Ballerina toolchain
- **Python backend:** run from `Python/` after installing `requirements.txt`

Make sure your API base URL in `src/config.js` (and `src/Components/config.js`) points to the backend instance you are using.

## Notes

- This repository currently contains both Ballerina and Python backend implementations.
- Review backend configuration files before running in production-like environments.
