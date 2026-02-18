🏛️ Scorecard Admin UI

A comprehensive admin dashboard built with React, Material-UI, Redux Toolkit, and Vite.js for managing legislative scorecards, senators, representatives, votes, activities, and congressional terms.

This application is designed for scalable data management, bulk operations, and term-aware legislative tracking with a clean, responsive UI.

✨ Features
🔐 Authentication & Security

Secure login and account activation flow

Role-based access for administrative users

Protected API access using custom headers

Environment-based configuration for sensitive keys

🏛️ Senators Management

Add, edit, and manage senators

Associate senators with congressional terms

Bulk publish and bulk position updates

Validation for missing or invalid term data

Robust error handling during bulk operations

🏢 Representatives Management

Add, edit, and manage representatives

Term-based vote and activity association

Improved validation and error messaging

Consistent data normalization across terms

🗳️ Votes Management

Add, edit, search, and manage legislative votes

Automatic term resolution based on vote date

Fallback logic when matching term does not exist

Bulk validation and publishing support

Detailed error feedback for partial failures

📋 Activities Management

Add, edit, search, and manage legislative activities

Group activities year-wise for better readability

Automatic term detection and normalization

Filter activities by chamber, year, and term

Graceful handling of missing or invalid term data

📆 Term Management

Centralized congressional term management

Shared term resolution logic across votes and activities

Validation helpers for date-based term matching

Safe handling of historical and future term data

🧩 Bulk Operations

Bulk publish / unpublish support

Bulk position editing

Partial success handling with detailed error reporting

Optimized UX to reduce UI blocking during bulk actions

🔍 Advanced Filtering & Search

Toggleable filter sections with reset functionality

Server-side pagination and searching

Responsive filters optimized for mobile screens

Consistent filtering behavior across modules

🎨 UI & UX

Built with Material-UI (MUI v6)

Fully responsive (desktop & mobile)

Reusable components for consistency

Clean layouts using MUI DataGrid

Centralized theme customization

🧠 State Management

Redux Toolkit for predictable state handling

Modular slices for:

Senators

Representatives

Votes

Activities

Terms

Optimized selectors and centralized loading/error states

🛠️ Helpers & Utilities

Centralized helper functions for:

Validation

Term normalization

Data processing

Debug-friendly logs for bulk and async operations

Shared utilities across modules

⚡ Performance & Reliability

Reduced UI wait time during heavy operations

Safe handling of partial API failures

Clear success and error feedback to users

Optimized rendering and state updates

🧑‍💻 Developer Experience

Fast builds with Vite.js

ESLint & Prettier for consistent code style

Scalable folder structure

Easy onboarding for new developers

🧰 Technology Stack

React 18

Material-UI (MUI) v6

Vite.js

Redux Toolkit

React Router

Emotion (CSS-in-JS)

Axios

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
│   ├── Activity/              # Activity management components
│   ├── App.css                # Global styles
│   ├── App.jsx                # Main application component with routing
│   ├── assets/                # Static assets (images, fonts, etc.)
│   ├── Authentication/        # Authentication components
│   ├── components/            # Reusable UI components
│   ├── Dashboard/             # Dashboard-related components
│   ├── helpers/               # Utility helper functions
│   ├── hooks/                 # Custom React hooks
│   ├── main.jsx               # Application entry point
│   ├── Manageterm/            # Term management components
│   ├── redux/                 # Redux store and slices
│   ├── Representative/        # Representative management components
│   ├── Senator/               # Senator management components
│   ├── shared-theme/          # Theme configuration
│   ├── styles/                # Additional stylesheets
│   ├── Themes/                # Theme-related files
│   ├── utils/                 # Utility functions
│   └── votes/                 # Vote management components
├── public/                    # Public assets
└── vite.config.js             # Vite configuration
```

## Configuration

### Environment Variables

**Important**: Create a `.env` file in the root directory before running the application. You can copy `.env.example` as a template:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Backend API URL
VITE_API_URL=https://your-api-url.com

# Protected API Key (x-protected-key header)
# This key is used for authenticated API requests
# DO NOT commit this value to version control
VITE_API_PROTECTED_KEY=your-protected-api-key-here
```

**Security Note**:

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Use different API keys for development and production environments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
