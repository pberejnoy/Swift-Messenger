# Swift Messenger — Core Setup

This document provides an overview of the core architecture and how to use the various components of the Swift Messenger application.

## Core Architecture

The core of Swift Messenger is designed to be modular, resilient, and scalable. It provides the foundation for all features and ensures consistency across the application.

### Directory Structure

\`\`\`
/src/core/
  ├── auth/             # Authentication components and logic
  ├── components/       # Shared core components
  ├── error-boundary/   # Error handling components
  ├── hooks/            # Custom React hooks
  ├── layout/           # Layout components
  ├── routing/          # Routing configuration
  ├── types/            # TypeScript type definitions
  └── utils/            # Utility functions
\`\`\`

## Authentication

### AuthProvider

The `AuthProvider` is the central component for authentication. It manages the user's authentication state and provides methods for login, registration, and logout.

#### Usage

Wrap your application with the `AuthProvider`:

\`\`\`tsx
// app/layout.tsx
import { AuthProvider } from '@/src/core/auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
\`\`\`

#### Accessing Auth State

Use the `useAuth` hook to access authentication state and methods:

\`\`\`tsx
import { useAuth } from '@/src/core/auth';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout, register } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={() => logout()}>Log out</button>
      ) : (
        <button onClick={() => login('user@example.com', 'password')}>Log in</button>
      )}
    </div>
  );
}
\`\`\`

### Protected Routes

Use the `ProtectedRoute` component to restrict access to authenticated users:

\`\`\`tsx
// app/dashboard/page.tsx
'use client';

import { ProtectedRoute } from '@/src/core/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Dashboard content (only visible to authenticated users)</div>
    </ProtectedRoute>
  );
}
\`\`\`

### Admin Routes

Use the `AdminRoute` component to restrict access to administrators:

\`\`\`tsx
// app/admin/dashboard/page.tsx
'use client';

import { AdminRoute } from '@/src/core/auth';
import { AdminLayout } from '@/src/core/layout';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminLayout>
        <div>Admin dashboard content (only visible to admins)</div>
      </AdminLayout>
    </AdminRoute>
  );
}
\`\`\`

## Routing

### Routes Object

Use the `routes` object for consistent route references:

\`\`\`tsx
import { routes } from '@/src/core/routing';
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href={routes.public.home}>Home</Link>
      <Link href={routes.protected.dashboard}>Dashboard</Link>
      <Link href={routes.protected.channels.root}>Channels</Link>
      <Link href={routes.protected.channels.view('channel-id')}>Specific Channel</Link>
    </nav>
  );
}
\`\`\`

## Layouts

### MainLayout

Use the `MainLayout` for regular pages:

\`\`\`tsx
// app/dashboard/page.tsx
'use client';

import { ProtectedRoute } from '@/src/core/auth';
import { MainLayout } from '@/src/core/layout';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div>Dashboard content</div>
      </MainLayout>
    </ProtectedRoute>
  );
}
\`\`\`

### AdminLayout

Use the `AdminLayout` for admin pages:

\`\`\`tsx
// app/admin/dashboard/page.tsx
'use client';

import { AdminRoute } from '@/src/core/auth';
import { AdminLayout } from '@/src/core/layout';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminLayout>
        <div>Admin dashboard content</div>
      </AdminLayout>
    </AdminRoute>
  );
}
\`\`\`

## Error Handling

### ErrorBoundary

Wrap components with `ErrorBoundary` to catch and handle errors:

\`\`\`tsx
import { ErrorBoundary } from '@/src/core/error-boundary';

function MyComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ComponentThatMightError />
    </ErrorBoundary>
  );
}
\`\`\`

## Custom Hooks

### useSocket

Subscribe to real-time updates:

\`\`\`tsx
import { useSocket } from '@/src/core/hooks';

function MessageList() {
  const { data, isConnected } = useSocket({
    table: 'messages',
    event: 'INSERT',
    filter: 'channel_id=eq.123',
  });

  useEffect(() => {
    if (data) {
      // Handle new message
    }
  }, [data]);

  return (
    <div>
      {isConnected ? 'Connected to real-time updates' : 'Connecting...'}
      {/* Message list */}
    </div>
  );
}
\`\`\`

### useOnlineStatus

Check if the user is online:

\`\`\`tsx
import { useOnlineStatus } from '@/src/core/hooks';

function ConnectionStatus() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {isOnline ? 'You are online' : 'You are offline'}
    </div>
  );
}
\`\`\`

### useLocalStorage

Store and retrieve data from localStorage:

\`\`\`tsx
import { useLocalStorage } from '@/src/core/hooks';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle theme (current: {theme})
    </button>
  );
}
\`\`\`

## Utilities

### Date Utilities

Format dates and times:

\`\`\`tsx
import { formatDate, formatTime, formatRelativeTime } from '@/src/core/utils';

function MessageTimestamp({ date }) {
  return (
    <div>
      <div>{formatRelativeTime(date)}</div>
      <div>{formatDate(date)} at {formatTime(date)}</div>
    </div>
  );
}
\`\`\`

### String Utilities

Manipulate strings:

\`\`\`tsx
import { truncate, capitalize, getInitials } from '@/src/core/utils';

function UserAvatar({ name, bio }) {
  return (
    <div>
      <div className="avatar">{getInitials(name)}</div>
      <div>{capitalize(name)}</div>
      <div>{truncate(bio, 100)}</div>
    </div>
  );
}
\`\`\`

### Validation Utilities

Validate user input:

\`\`\`tsx
import { isValidEmail, isValidPassword, isValidUsername } from '@/src/core/utils';

function validateForm(data) {
  const errors = {};

  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters with one number and one special character';
  }

  if (!isValidUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  }

  return errors;
}
\`\`\`

## Best Practices

1. **Use the Core Components**: Always use the core components and utilities instead of creating duplicates.
2. **Follow the Pattern**: Maintain the established patterns when adding new features.
3. **Keep Core Clean**: Don't add feature-specific code to the core. Instead, build features that use the core.
4. **Document Changes**: Update this documentation when making significant changes to the core.
5. **Error Handling**: Always use error boundaries and proper error handling.
6. **Type Safety**: Maintain and use the TypeScript types for type safety.
