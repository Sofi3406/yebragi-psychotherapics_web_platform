# Yebragi Frontend - React TypeScript Application

A beautiful, modern frontend application for the Yebragi Psychotherapy Platform built with React, TypeScript, Vite, and Tailwind CSS.

## 📁 Folder Structure

```
frontend/
├── public/                 # Static assets (if any)
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Layout/        # Layout components (Navbar, Footer, MainLayout)
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainLayout.tsx
│   │   └── ProtectedRoute.tsx  # Route protection component
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.tsx      # Authentication context
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Verify.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Appointments.tsx
│   │   ├── Articles.tsx
│   │   ├── Chat.tsx
│   │   └── Profile.tsx
│   ├── services/          # API service layer
│   │   ├── api.ts         # Axios instance with interceptors
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── appointmentService.ts
│   │   ├── articleService.ts
│   │   ├── chatService.ts
│   │   ├── paymentService.ts
│   │   └── meetService.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main app component with routes
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles and Tailwind imports
│   └── vite-env.d.ts      # Vite environment types
├── .eslintrc.cjs          # ESLint configuration
├── .gitignore            # Git ignore rules
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for Node tools
└── vite.config.ts        # Vite build configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn or pnpm
- Backend server running on `http://localhost:3000`

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` file (if needed):**
   ```env
   VITE_API_URL=http://localhost:3000
   ```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

### Linting

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🏗️ Architecture

### Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

### Key Features

1. **Type-Safe**: Full TypeScript implementation
2. **Modern UI**: Beautiful, responsive design with Tailwind CSS
3. **Authentication**: Complete auth flow (register, login, verify)
4. **Protected Routes**: Route protection based on authentication
5. **API Integration**: Full integration with backend APIs
6. **Error Handling**: Comprehensive error handling and user feedback
7. **Token Management**: Automatic token refresh on expiry

## 📄 File Descriptions

### Core Files

- **`src/main.tsx`**: Application entry point, sets up React Router and providers
- **`src/App.tsx`**: Main app component with route definitions
- **`src/index.css`**: Global styles and Tailwind CSS imports

### Services (`src/services/`)

- **`api.ts`**: Axios instance with request/response interceptors for token management
- **`authService.ts`**: Authentication API calls (login, register, verify, refresh)
- **`userService.ts`**: User profile management API calls
- **`appointmentService.ts`**: Appointment CRUD operations
- **`articleService.ts`**: Article fetching operations
- **`chatService.ts`**: Chatbot message sending
- **`paymentService.ts`**: Payment initiation
- **`meetService.ts`**: Video meeting link management

### Contexts (`src/contexts/`)

- **`AuthContext.tsx`**: Global authentication state management with React Context

### Pages (`src/pages/`)

- **`Login.tsx`**: User login page
- **`Register.tsx`**: User registration page
- **`Verify.tsx`**: Email verification with OTP
- **`Dashboard.tsx`**: Main dashboard with appointment overview
- **`Appointments.tsx`**: List and manage appointments
- **`Articles.tsx`**: Browse mental health articles
- **`Chat.tsx`**: AI chatbot interface
- **`Profile.tsx`**: User profile management

### Components (`src/components/`)

- **`Layout/Navbar.tsx`**: Navigation bar with user menu
- **`Layout/Footer.tsx`**: Footer component
- **`Layout/MainLayout.tsx`**: Main layout wrapper
- **`ProtectedRoute.tsx`**: HOC for protecting authenticated routes

## 🔌 API Integration

The frontend communicates with the backend API at `http://localhost:3000` (configurable via `VITE_API_URL`).

### API Endpoints Used

- **Auth**: `/api/v1/auth/*` (register, login, verify, refresh)
- **Users**: `/api/users/*` (profile management)
- **Appointments**: `/api/v1/appointments/*` (CRUD operations)
- **Articles**: `/api/v1/articles/*` (list, get one)
- **Chat**: `/api/v1/chat/message` (send message)
- **Payments**: `/api/v1/payments/*` (initiate, webhook)
- **Meet**: `/api/meet/*` (meeting links)

### Authentication Flow

1. User registers → receives OTP
2. User verifies email with OTP → receives access & refresh tokens
3. Tokens stored in localStorage
4. Axios interceptor adds token to requests
5. On 401, automatically refreshes token
6. On refresh failure, redirects to login

## 🎨 Styling

The application uses Tailwind CSS for styling with a custom color palette:

- **Primary Colors**: Blue shades (primary-50 to primary-900)
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Gradient buttons, rounded corners, shadows
- **Icons**: Lucide React icon library

## 🔒 Security

- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh on expiry
- Protected routes require authentication
- CORS configured on backend for `http://localhost:5173`

## 🚧 Development Notes

- All components are TypeScript (.tsx)
- All services are TypeScript (.ts)
- Type definitions in `src/types/`
- Environment variables prefixed with `VITE_`
- Hot module replacement enabled in development

## 📦 Dependencies

### Production Dependencies

- `react` & `react-dom`: React library
- `react-router-dom`: Routing
- `axios`: HTTP client
- `lucide-react`: Icons
- `date-fns`: Date utilities
- `react-hot-toast`: Notifications

### Development Dependencies

- `typescript`: TypeScript compiler
- `vite`: Build tool
- `@vitejs/plugin-react`: Vite React plugin
- `tailwindcss`: CSS framework
- `autoprefixer`: CSS post-processor
- `eslint`: Linter
- `@typescript-eslint/*`: TypeScript ESLint plugins

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is in use, Vite will automatically try the next available port.

### API Connection Issues

- Ensure backend is running on `http://localhost:3000`
- Check CORS settings in backend
- Verify `VITE_API_URL` in `.env` file

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)

## 📄 License

ISC







