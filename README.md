# Scorecard Admin UI

A comprehensive admin dashboard built with React, Material-UI, and Vite.js for managing legislative scorecards, representatives, senators, and bills.

## Features

- **Authentication System**: User login and management
- **Dashboard**: Overview with statistics and charts
- **Bills Management**: Add, search, and manage legislative bills
- **Representatives/Senators**: Manage legislative representatives and senators
- **Redux State Management**: Centralized state management
- **Custom Themes**: Light/dark mode and extensive theme customization
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- React 18
- Material-UI (MUI) v6
- Vite.js
- Redux Toolkit
- React Router
- Emotion (CSS-in-JS)
- TinyMCE (rich text editor)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Teamgrid-Solutions-Private-Limited/Scorecard_Admin_Ui.git
cd Scorecard_Admin_Ui
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Starts development server
- `npm run build`: Builds for production
- `npm run preview`: Previews production build locally
- `npm run lint`: Runs ESLint
- `npm run format`: Formats code with Prettier

## Project Structure

```
scorecard_admin_ui/
├── src/
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   ├── Authentication/    # Auth components
│   ├── Dashboard/         # Dashboard components
│   ├── Bills/             # Bills management
│   ├── Representative/    # Representative management
│   ├── Senator/           # Senator management
│   ├── redux/             # Redux store and slices
│   ├── shared-theme/      # Theme configuration
│   └── assets/            # Static assets
├── public/                # Public assets
└── vite.config.js         # Vite configuration
```

## Configuration
The project includes environment files (.env.production, .env.development) in version control as they only contain:

Public-facing backend URLs

Environment variables should be placed in `.env` file:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_AUTH_ENDPOINT=/auth
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request


