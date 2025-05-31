# CKS Frontend

A Next.js frontend application for the Certified Kubernetes Security Specialist (CKS) practice environment. This application provides an interactive web interface for managing lab sessions, terminal access, and task validation.

## Overview

The CKS Frontend provides:
- **Lab Session Management**: Create, manage, and extend practice lab sessions
- **Interactive Terminal**: Browser-based terminal access to Kubernetes VMs via WebSocket
- **Task Management**: View scenario tasks with validation and progress tracking
- **Scenario Browser**: Browse and filter available CKS practice scenarios
- **Real-time Updates**: Live session status and validation feedback

## Architecture

Built with:
- **Next.js 14**: React framework with server-side rendering
- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Utility-first CSS framework
- **SWR**: Data fetching with caching and revalidation
- **WebSocket**: Real-time terminal connections
- **xterm.js**: Full-featured terminal emulator

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Access to CKS Backend API
- Modern web browser with WebSocket support

### Local Development

1. **Install dependencies**:
   ```bash
   cd src/
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: Navigate to `http://localhost:3000`

### Environment Variables

Create `.env.local` for local development:

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Optional: Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

## Deployment

### Container Build

Build the Docker container:

```bash
make build
```

Push to registry:

```bash
make push
```

### Kubernetes Deployment

Deploy to Kubernetes:

```bash
make deploy
```

The application will be available via the configured Ingress.

## Development

### Project Structure

```
src/
├── pages/                    # Next.js pages and API routes
│   ├── index.js             # Home page with scenario browser
│   ├── about.js             # About page
│   ├── lab/[id].js          # Lab environment page
│   └── _app.js              # App wrapper with providers
├── components/              # React components
│   ├── common/              # Reusable UI components
│   ├── Layout.js            # Main layout component
│   ├── ScenarioCard.js      # Scenario display component
│   ├── Terminal.js          # Terminal component
│   ├── TaskPanel.js         # Task management panel
│   └── TaskValidation.js    # Task validation component
├── hooks/                   # Custom React hooks
│   ├── useSession.js        # Session management
│   ├── useTerminal.js       # Terminal connection
│   └── useTaskValidation.js # Task validation
├── contexts/                # React context providers
│   ├── SessionContext.js    # Global session state
│   └── ToastContext.js      # Notification system
├── lib/                     # Utility libraries
│   └── api.js               # API client
├── utils/                   # Helper utilities
│   └── errorHandler.js      # Error handling
└── styles/                  # CSS and styling
    └── globals.css          # Global styles with Tailwind
```

### Key Components

#### Terminal Component
Browser-based terminal with features:
- Full xterm.js terminal emulator
- WebSocket connection to backend
- Search functionality (Ctrl+F)
- Copy/paste support
- Automatic reconnection

#### Session Management
Handles lab session lifecycle:
- Create sessions from scenarios
- Monitor session status and expiration
- Extend session time
- Clean up resources

#### Task Validation
Interactive task checking:
- Real-time validation of task completion
- Detailed feedback on validation results
- Progress tracking across multiple tasks

### API Integration

The frontend communicates with the CKS Backend via REST API and WebSocket:

**REST Endpoints:**
- `GET /api/v1/scenarios` - List available scenarios
- `POST /api/v1/sessions` - Create new lab session
- `GET /api/v1/sessions/{id}` - Get session details
- `POST /api/v1/sessions/{id}/tasks/{taskId}/validate` - Validate task

**WebSocket Endpoints:**
- `WS /api/v1/terminals/{id}/attach` - Terminal connection

### Error Handling

Centralized error handling with:
- Unified error processing
- User-friendly error messages
- Automatic retry mechanisms
- Toast notifications for user feedback

## Available Scripts

In the `src/` directory:

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Container operations (from root)
make build           # Build Docker image
make push            # Push to registry
make deploy          # Deploy to Kubernetes
make clean           # Clean up resources
```

## Browser Support

- **Modern browsers** with ES2018+ support
- **WebSocket** support required for terminal functionality
- **Responsive design** for desktop and mobile devices

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Make changes** following the existing code style
4. **Test thoroughly** including terminal functionality
5. **Submit pull request** with clear description

### Code Style

- **ESLint**: Follow the configured linting rules
- **React Hooks**: Use functional components with hooks
- **Tailwind CSS**: Use utility classes for styling
- **Error Handling**: Use the centralized error handler

## License

This project is part of the CKS practice environment for educational purposes.

## Related Projects

- **[CKS Backend](https://github.com/your-org/cks-backend)** - Backend API and Kubernetes integration
- **[CKS Old repo](https://github.com/your-org/cks)** - Working local monorepo where I started