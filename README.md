# DevBoard

A comprehensive task management application built with the MERN stack (MongoDB, Express, React, Node.js), featuring Kanban-style boards, real-time collaboration, and team management capabilities.

## Authors

**Nasandratra Sartin Harivonjy Niaina**
> "In difficult times carry something beautiful in your heart." - Blaise Pascal

**Fernando Arias**
> Hi, this is Fernando.

**Andrew Parry**
> "Believe in yourself, and you're already halfway there." - Theodore Roosevelt

## Features

- **Kanban Board Management** - Create, edit, and organize boards with drag-and-drop functionality
- **Task Management** - Full CRUD operations for tasks with comments and tags
- **User Authentication** - Complete auth system with OAuth integration (Google, GitHub, LinkedIn)
- **Profile Management** - User profiles with credential management and account settings
- **Real-time Updates** - Live collaboration with Socket.io
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## Tech Stack

### Frontend
- **React** 19.1.0 with Vite 7.0+ - Modern React development
- **React Router DOM** 7.7.0 - Client-side routing
- **Tailwind CSS** 4.1+ - Utility-first CSS framework
- **React SortableJS** - Drag and drop functionality for kanban boards
- **Axios** 1.10+ - HTTP client for API requests
- **Socket.io Client** 4.7+ - Real-time communication
- **Heroicons** - Beautiful hand-crafted SVG icons

### Backend
- **Node.js** with Express.js - RESTful API server
- **MongoDB** with Mongoose - Database and ODM
- **Socket.io** - Real-time bidirectional communication
- **Passport.js** - Authentication middleware

- **JWT** - Secure authentication tokens
- **Nodemailer** - Email services for notifications

### Development Tools
- **ESLint** 9.31+ - Code linting for both frontend and backend
- **Prettier** 3.6+ - Code formatting
- **Concurrently** - Run multiple development servers
- **Nodemon** 3.1+ - Development server auto-restart
- **Swagger** - API documentation with swagger-jsdoc & swagger-ui-express
- **Vitest** - Frontend testing framework
- **npm-run-all** - Run multiple npm scripts efficiently

## Project Structure

```
DevBoard/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Authentication/ # Login, Register, OAuth
│   │   │   ├── Board/          # Board management components
│   │   │   ├── Column/         # Kanban column components
│   │   │   ├── Dashboard/      # Project dashboard
│   │   │   ├── Layout/         # Header, Footer, Protected routes
│   │   │   ├── ProfileManagement/ # User profile & settings
│   │   │   ├── Shared/         # Reusable UI components
│   │   │   └── Task/           # Task management components
│   │   ├── pages/              # Main application pages
│   │   ├── services/           # API service layers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper utilities
│   │   └── config/             # Frontend configuration
│   └── package.json
├── server/                     # Express backend
│   ├── config/                 # Database, JWT, Passport, Multer config
│   ├── controllers/            # Route handlers and business logic
│   ├── middlewares/            # Authentication and validation middleware
│   ├── models/                 # MongoDB schemas (User, Board, Task, etc.)
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic services
│   ├── validators/             # Input validation schemas
│   ├── templates/              # Email templates
│   ├── swagger.js              # API documentation setup
│   └── server.js               # Express server entry point
├── package.json                # Root package with scripts
├── .prettierrc                 # Code formatting configuration
└── README.md
```

## API Documentation

The API is fully documented with Swagger. Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Swagger JSON**: `http://localhost:5000/api-docs.json`

## Getting Started

### Prerequisites

- **Node.js** (Latest LTS version recommended)
- **MongoDB** (Local installation or MongoDB Atlas)
- **npm** or **yarn**

### Environment Variables

Create `.env` files in both client and server directories:

**Server `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/devboard
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
PORT=5000
```

**Client `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevBoard
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables** (see above)

4. **Start the development servers**
   ```bash
   npm run dev
   ```

### Available Scripts

**Root level commands:**
- `npm run dev` - Start both client and server in development mode
- `npm run client` - Start only the React frontend
- `npm run server` - Start only the Express backend  
- `npm run install-all` - Install dependencies for both client and server
- `npm run install-server` - Install server dependencies only
- `npm run install-client` - Install client dependencies only
- `npm run lint` - Run ESLint on both client and server
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth
- `GET /api/auth/linkedin` - LinkedIn OAuth

### Boards
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Tasks
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users & Profiles
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

## Development Status

✅ **Completed Features:**
- User authentication with OAuth integration
- Board and task management
- Real-time collaboration
- Profile management
- API documentation
- Responsive UI design


## License

MIT

---

*Last updated: August 2025 - Full-featured MERN stack task management application*