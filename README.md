# Vibe Code Adventure

A web application that recreates classic 80s/90s text adventures. Players log in with just a username, create a character, and explore a world using typed commands. The game features inventory management, multiple rooms, NPC interactions, puzzles, scoring, and the ability to save/load progress.

## Features

- **Simple Authentication**: Log in with just a username - no passwords required
- **Character Creation**: Create and customize your character with attributes
- **Text Command Interface**: Type commands to interact with the game world
- **Inventory Management**: Collect, examine, and use items
- **Multiple Rooms**: Explore interconnected rooms and environments
- **NPC Interactions**: Talk to and interact with non-player characters
- **Combat System**: Turn-based combat with weapons and status effects
- **Save/Load System**: Multiple save slots to preserve your progress
- **Map System**: Visual representation of explored areas
- **Scoring System**: Track your achievements and progress
- **Responsive Design**: Works on both desktop and mobile devices

## Technology Stack

### Frontend
- **React** with **TypeScript** for the user interface
- **Material-UI** for modern, responsive styling
- Runs on port 5566

### Backend
- **Node.js** with **Express** for REST API endpoints
- **TypeScript** for type safety and maintainability
- **SQLite** for lightweight, file-based data persistence
- Runs on port 8000

### Testing
- **Jest** for unit and integration testing

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe-code-adventure
   ```

2. **Navigate to the source directory**
   ```bash
   cd src
   ```

3. **Install backend dependencies**
   ```bash
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

### Running the Application

1. **Start both frontend and backend**
   ```bash
   cd src
   npm run dev
   ```

   This will start:
   - Backend API server on http://localhost:8000
   - Frontend React app on http://localhost:5566

2. **Access the application**
   - Open your browser and navigate to http://localhost:5566
   - Enter a username to start playing

### Running Tests

```bash
cd src
npm test
```

## Project Structure

```
vibe-code-adventure/
├── src/
│   ├── client/                 # React frontend application
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── App.tsx         # Main application component
│   │   │   └── index.tsx       # Application entry point
│   │   ├── public/             # Static assets
│   │   └── package.json        # Frontend dependencies
│   ├── server/                 # Node.js backend
│   │   ├── database.ts         # Database operations and models
│   │   ├── database.test.ts    # Database tests
│   │   └── index.ts            # Express server and API routes
│   ├── package.json            # Backend dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   └── nodemon.json            # Nodemon configuration
├── specs/                      # User stories and feature specifications
│   ├── 0100/                   # Authentication features
│   ├── 0200/                   # Command parser features
│   ├── 0300/                   # Character creation features
│   └── ...                     # Additional feature directories
├── CLAUDE.md                   # Project instructions for AI assistant
└── README.md                   # This file
```

## Development Workflow

### Contributing Guidelines

1. **Feature Development**
   - Each feature is documented in the `specs/` directory
   - Follow the user story format for new features
   - Implement features incrementally following the story acceptance criteria

2. **Code Standards**
   - Use TypeScript for all new code
   - Follow existing code style and conventions
   - Write unit tests for new functionality
   - Ensure all tests pass before committing

3. **Commit Process**
   - Commit after each user story implementation
   - Write clear, descriptive commit messages
   - Test your changes before committing

4. **Testing Strategy**
   - Write unit tests after implementing features
   - Focus on testing individual features rather than end-to-end tests
   - Ensure database operations are properly tested

### Available Scripts

From the `src/` directory:

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend application
- `npm test` - Run all tests
- `npm run build` - Build both frontend and backend for production

### Server Management

- The development setup assumes you keep a server running during development
- Use the active running server first before starting a new one
- Backend runs on port 8000, frontend on port 5566

## Game Design

### Authentication System
- Players log in with just a username
- No password required for simplicity
- If username exists, player is automatically logged in to existing session
- If username is new, a new player account is created
- Multiple players can share the same username (each gets their own session)

### User Stories
The game features are organized into numbered feature sets in the `specs/` directory:

- **0100**: Simple Authentication
- **0200**: Text Command Parser
- **0300**: Character Creation
- **0400**: Inventory Management
- **0500**: Adventure Concept
- **0550**: Combat System
- **0600**: Save/Load System
- **0700**: Multiple Rooms
- **0750**: Map System
- **0800**: NPC Interactions
- **0900**: Scoring and Tracking
- **1000**: Responsive UI

Each feature directory contains detailed user stories with acceptance criteria.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Log in with username
- `POST /api/auth/logout` - Log out current session
- `GET /api/auth/session/:sessionId` - Validate session

### User Management
- `GET /api/users` - Get all users (for development/debugging)

### General
- `GET /api/hello` - Health check endpoint

## Database Schema

The application uses SQLite with the following main table:

```sql
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow the development workflow** outlined above
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Pull Request Guidelines

- Ensure all tests pass
- Follow the existing code style
- Update documentation if needed
- Reference any related user stories or issues
- Provide a clear description of changes

## License

This project is licensed under the ISC License.

## Support

For questions or issues, please refer to the user stories in the `specs/` directory or open an issue in the repository.