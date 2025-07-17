# DevBoard

A development board task manager built with the MERN stack (MongoDB, Express, React, Node.js).

## Authors

**Nasandratra Sartin Harivonjy Niaina**
> "In difficult times carry something beautiful in your heart." - Blaise Pascal

**Fernando Arias**
> Hi, this is Fernando.

**Andrew Parry**
> "Believe in yourself, and you're already halfway there." - Theodore Roosevelt

## Tech Stack

### Frontend
- **React** 19.1.0 - UI framework
- **React Router DOM** 7.7.0 - Client-side routing
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time communication
- **React DnD** - Drag and drop functionality for task management
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.io** - Real-time bidirectional communication

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands simultaneously
- **Nodemon** - Development server auto-restart

## Project Structure

```
devboard/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/          # User Authentication & Management
│   │   │   ├── Dashboard/     # Project Dashboard 
│   │   │   ├── Board/         # Kanban Board Interface
│   │   │   ├── Task/          # Task Management
│   │   │   └── Team/          # Team Collaboration
│   │   ├── pages/
│   │   ├── services/          # API calls with Axios
│   │   └── hooks/             # Custom React hooks
│   └── package.json           # Client dependencies
├── server/                    # Express backend
│   ├── models/                # User, Board, Column, Task, Comment
│   ├── routes/                # auth, users, boards, tasks, upload
│   ├── controllers/           # Business logic for each route
│   ├── middleware/            # JWT auth, validation, errorHandler
│   ├── config/                # database.js, auth.js (Passport), multer.js
│   ├── services/              # authService, boardService, taskService, emailService
│   ├── utils/                 # constants, helpers, validators
│   ├── uploads/               # File upload directory (images/, documents/)
│   ├── server.js              # Express server entry point
│   └── package.json           # Server dependencies
├── package.json               # Root package configuration
├── .prettierrc                # Prettier configuration
└── README.md                  # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (latest LTS version recommended)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devboard
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

   Or install separately:
   ```bash
   npm run install-server
   npm run install-client
   ```

3. **Set up environment variables**
   ```bash
   # Create .env files in both client and server directories
   # Configuration details to be added
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (React) and backend (Express) servers concurrently.

### Available Scripts

**Root level commands:**
- `npm run dev` - Start both client and server in development mode
- `npm run client` - Start only the React frontend
- `npm run server` - Start only the Express backend
- `npm run install-all` - Install dependencies for both client and server
- `npm run lint` - Run ESLint on both client and server
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Development Status

🚧 **Work in Progress** 🚧

This project is currently in the initial setup phase. The following has been completed:
- Project structure setup
- Frontend and backend package configurations
- Development tooling (ESLint, Prettier, Concurrently)
- Core dependencies installation

## License

MIT

---

*Last updated: Initial project setup with MERN stack configuration*