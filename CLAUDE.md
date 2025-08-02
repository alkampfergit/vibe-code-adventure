# Software description

A web app that recreates classic 80s/90s text adventures. Players log in with just a username, create a character, and explore a world using typed commands. The game features inventory management, multiple rooms, NPC interactions, puzzles, scoring, and the ability to save/load progress. The interface is responsive for both desktop and mobile.

# Technology Stack for Text Adventure Web Application

## Frontend

- **React**: For building a responsive and interactive user interface.
- **TypeScript**: Adds type safety and improves code maintainability.
- **Material UI**: For modern, responsive styling.

## Backend

- **Node.js** with **Express**: Handles REST API endpoints and core game logic.
- **TypeScript**: Ensures consistency and type safety across the backend.

## Persistence

- Use Node.js node:sqlite for a lightweight, file-based database to store data for the game.

## Tooling & Testing

- **Jest**: For unit and integration testing.

---
This stack is designed for rapid development, scalability, and maintainability, suitable for a modern web-based text adventure

# Development Workflow

- Commit after each user story implementation to maintain clear version history and traceability
- Write unit tests after implementing a feature to verify its functionality
- Prefer testing each feature instead of doing end-to-end tests

## ⁠Server Management

- don't run 'npm run dev', always try to use active running server first because the user usually keeps a server running


