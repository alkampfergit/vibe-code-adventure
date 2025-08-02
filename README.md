# Vibe Text Adventure

A web-based text adventure game inspired by classic 80s/90s interactive fiction. Players create characters, explore rooms, manage inventory, interact with NPCs, and solve puzzles in a retro-styled gaming experience.

## 🎮 Features

- **Simple Authentication**: Username-based login with session persistence
- **Character Creation**: Customizable attributes (Strength, Dexterity, Intelligence)
- **Text Command Parser**: Natural language commands with synonyms and feedback
- **Inventory Management**: Collect, examine, and use items
- **Multiple Rooms**: Explore interconnected locations with descriptions
- **NPC Interactions**: Dialogue and combat systems
- **Save/Load System**: Multiple save slots with progress tracking
- **Scoring System**: Points tracking with explanations
- **Responsive UI**: Works on desktop and mobile devices
- **Retro Aesthetic**: 80s/90s terminal-inspired design

## 🏗️ Architecture

### Project Structure

```
vibe-code-adventure/
├── src/
│   ├── frontend/                 # React TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── GameInterface.tsx
│   │   │   │   ├── CharacterCreation.tsx
│   │   │   │   ├── CommandInput.tsx
│   │   │   │   └── GameOutput.tsx
│   │   │   ├── services/         # API service layer
│   │   │   │   ├── authService.ts
│   │   │   └── gameService.ts
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── types/            # Frontend-specific types
│   │   │   ├── utils/            # Utility functions
│   │   │   ├── App.tsx           # Main application component
│   │   │   ├── main.tsx          # Application entry point
│   │   │   └── theme.ts          # Material-UI theme
│   │   ├── public/               # Static assets
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── backend/                  # Node.js Express API server
│   │   ├── src/
│   │   │   ├── controllers/      # Request handlers
│   │   │   │   ├── AuthController.ts
│   │   │   │   └── GameController.ts
│   │   │   ├── models/           # Data models (future use)
│   │   │   ├── routes/           # API route definitions
│   │   │   │   ├── authRoutes.ts
│   │   │   │   └── gameRoutes.ts
│   │   │   ├── services/         # Business logic
│   │   │   │   ├── DatabaseService.ts
│   │   │   │   └── CommandParser.ts
│   │   │   ├── middleware/       # Express middleware
│   │   │   │   └── errorHandler.ts
│   │   │   ├── database/         # Database setup and migrations
│   │   │   │   └── DatabaseService.ts
│   │   │   ├── utils/            # Utility functions
│   │   │   └── server.ts         # Express server setup
│   │   ├── data/                 # SQLite database files
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                   # Shared TypeScript types
│       └── types/
│           └── index.ts          # Common interfaces
│
├── specs/                        # Feature specifications
├── package.json                  # Root package.json (workspace)
├── CLAUDE.md                     # Project instructions
└── README.md                     # This file
```

### Technology Stack

#### Frontend
- **React 18**: Modern component-based UI library
- **TypeScript**: Type-safe JavaScript development
- **Material-UI v5**: Component library with retro theming
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication

#### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **TypeScript**: Consistent typing across the stack
- **SQLite**: Lightweight embedded database (node:sqlite)
- **Security Middleware**: Helmet, CORS, rate limiting

#### Development Tools
- **Vitest**: Unit testing framework
- **ESLint**: Code linting and formatting
- **Concurrently**: Run multiple npm scripts simultaneously

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe-code-adventure
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies and workspace packages
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   ```

   Or start individually:
   ```bash
   # Backend only (http://localhost:3001)
   npm run dev:backend
   
   # Frontend only (http://localhost:3000)
   npm run dev:frontend
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health check: http://localhost:3001/api/health

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

### Testing

```bash
# Run all tests
npm test

# Test individually
npm run test:frontend
npm run test:backend
```

### Linting

```bash
# Lint all code
npm run lint

# Lint individually  
npm run lint:frontend
npm run lint:backend
```

## 🎯 Game Features

### Authentication Flow
1. User enters username on login screen
2. System creates user account if doesn't exist
3. Session persisted in localStorage
4. Logout clears session data

### Character Creation
1. Enter character name
2. Distribute 40 attribute points across:
   - Strength (affects health and combat)
   - Dexterity (affects speed and accuracy) 
   - Intelligence (affects magic and puzzles)
3. System calculates derived stats (health = strength × 10)

### Game Commands
- `look` - Examine current room
- `go [direction]` - Move between rooms (north, south, east, west)
- `inventory` / `inv` - View carried items
- `take [item]` - Pick up items
- `use [item]` - Use inventory items
- `talk [npc]` - Interact with characters
- `save` - Save game progress
- `score` - View current points
- `help` - Show available commands

### Game World
- **Rooms**: Interconnected locations with descriptions, exits, items, and NPCs
- **Items**: Objects with types (weapon, armor, consumable, quest, misc)
- **NPCs**: Characters with dialogue trees, some hostile for combat
- **Inventory**: Weight and value-based item management
- **Scoring**: Points awarded for discoveries, quest completion, combat victories

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with username
- `POST /api/auth/logout` - User logout

### Game Management  
- `POST /api/game/character` - Create new character
- `GET /api/game/state/:userId` - Load game state
- `POST /api/game/save` - Save game progress
- `POST /api/game/command` - Execute game command

### Health Check
- `GET /api/health` - Service status

## 🗄️ Database Schema

### Tables
- **users**: User accounts and authentication
- **characters**: Character stats and progression
- **game_states**: Save game data and current state
- **inventory_items**: Player item ownership
- **items**: Game item definitions
- **rooms**: World locations and connections
- **npcs**: Non-player character data

### Key Relationships
- Users → Characters (one-to-many)
- Characters → Game States (one-to-many)
- Game States → Inventory Items (one-to-many)
- Items ← Inventory Items (many-to-one)

## 🎨 UI/UX Design

### Retro Aesthetic
- **Colors**: Green text on black background (#00ff00 on #000000)
- **Typography**: Monospace fonts throughout
- **Layout**: Terminal-inspired with bordered containers
- **Responsive**: Adapts to mobile and desktop screens

### User Experience
- **Immediate Feedback**: Commands show results instantly  
- **Persistent State**: Game progress automatically saved
- **Error Handling**: Clear messages for invalid commands
- **Accessibility**: Keyboard navigation and screen reader support

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse (100 requests/15 minutes)
- **Input Validation**: Sanitizes user inputs
- **Error Handling**: Doesn't expose sensitive information
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers for common vulnerabilities

## 🧪 Testing Strategy

### Frontend Testing
- Component rendering tests
- User interaction testing
- API service mocking
- Theme and styling verification

### Backend Testing  
- API endpoint testing
- Database operation testing
- Command parser testing
- Error handling verification

## 📈 Future Enhancements

### Planned Features
- **Combat System**: Turn-based battles with NPCs
- **Map System**: Visual representation of explored areas
- **Quest System**: Structured objectives and rewards
- **Multiplayer**: Shared world experiences
- **Adventure Editor**: User-created content
- **Audio**: Sound effects and background music

### Technical Improvements
- **Caching**: Redis for session and game state caching
- **Database**: PostgreSQL for production scalability
- **Authentication**: JWT tokens and OAuth integration
- **Monitoring**: Application metrics and logging
- **Deployment**: Docker containers and CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by classic text adventures like Zork and Adventure
- Built with modern web technologies for accessibility
- Designed for both nostalgia and contemporary user experience