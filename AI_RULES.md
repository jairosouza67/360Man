# AI Development Rules - Respect Pill

## Tech Stack Overview

- **Frontend**: React 18 with TypeScript and Vite for fast development and type safety
- **Backend**: Firebase (Firestore for database, Authentication, Storage) as a BaaS solution
- **State Management**: Zustand for simple, lightweight state management
- **Styling**: Tailwind CSS with custom dark theme design system
- **Routing**: React Router for client-side navigation
- **Forms**: React Hook Form with Zod for validation and type-safe forms
- **Notifications**: Sonner for toast notifications
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for data visualization
- **Payments**: Stripe integration for subscription management

## Library Usage Rules

### Database & Storage
- **ALWAYS** use Firebase Firestore for all database operations
- **ALWAYS** use Firebase Storage for file uploads (avatars, attachments)
- **NEVER** use localStorage for sensitive data - use Firebase only
- **ALWAYS** follow the collection schema defined in `docs/database-schema.md`
- **ALWAYS** handle Firebase errors gracefully with user-friendly messages

### State Management
- **ALWAYS** use Zustand for global state (auth, trackers, plans)
- **NEVER** use Redux or Context API for new features
- **ALWAYS** keep stores focused and single-purpose
- **ALWAYS** use TypeScript interfaces for store types

### UI Components & Styling
- **ALWAYS** use Tailwind CSS classes for styling
- **NEVER** write inline styles or CSS files
- **ALWAYS** use the custom color palette defined in `tailwind.config.js`
- **ALWAYS** maintain the dark theme consistency
- **PREFER** shadcn/ui components when available, but customize to match our theme
- **ALWAYS** ensure responsive design with mobile-first approach

### Forms & Validation
- **ALWAYS** use React Hook Form for form management
- **ALWAYS** use Zod schemas for validation
- **NEVER** handle form state manually with useState
- **ALWAYS** provide clear error messages and loading states

### Authentication & Security
- **ALWAYS** use Firebase Authentication for all auth operations
- **NEVER** store passwords or sensitive tokens in localStorage
- **ALWAYS** implement proper error handling for auth flows
- **ALWAYS** use the authStore for authentication state

### API & External Services
- **ALWAYS** use Firebase SDK for database operations
- **ALWAYS** use Stripe SDK for payment processing
- **NEVER** use fetch directly for Firebase operations
- **ALWAYS** implement proper error boundaries for API calls

### File Structure & Organization
- **ALWAYS** place pages in `src/pages/`
- **ALWAYS** place components in `src/components/`
- **ALWAYS** place stores in `src/stores/`
- **ALWAYS** place utilities in `src/utils/`
- **NEVER** create components larger than 100 lines - refactor when needed
- **ALWAYS** use descriptive file names with PascalCase for components

### Code Quality & Best Practices
- **ALWAYS** use TypeScript for all new files
- **ALWAYS** handle errors with try/catch blocks (unless specifically told not to)
- **ALWAYS** provide loading states for async operations
- **ALWAYS** use semantic HTML elements
- **ALWAYS** implement proper accessibility (ARIA labels, keyboard navigation)
- **NEVER** leave TODO comments or placeholder implementations
- **ALWAYS** write complete, functional features - no partial implementations

### Performance & Optimization
- **ALWAYS** use React.memo for expensive components
- **ALWAYS** implement proper lazy loading for routes
- **ALWAYS** optimize images and assets
- **NEVER** create unnecessary re-renders

### Content & Features
- **ALWAYS** maintain the respectful, non-toxic approach to male development
- **NEVER** implement misogynistic or harmful content
- **ALWAYS** focus on constructive growth and healthy masculinity
- **ALWAYS** implement proper content moderation features
- **ALWAYS** age-gate sensitive content appropriately

## Development Workflow

1. **Before coding**: Check if the feature already exists
2. **During coding**: Follow all library usage rules above
3. **After coding**: Ensure TypeScript compilation, responsive design, and error handling
4. **Testing**: Test all user flows and edge cases
5. **Documentation**: Update relevant documentation if needed

## Prohibited Patterns

- ❌ Using localStorage for sensitive data
- ❌ Inline styles or CSS files
- ❌ Manual form state management
- ❌ Direct fetch calls to Firebase
- ❌ Partial implementations or TODO comments
- ❌ Components larger than 100 lines without refactoring
- ❌ Ignoring TypeScript errors
- ❌ Skipping error handling
- ❌ Breaking the dark theme consistency

## Required Patterns

- ✅ Firebase for all data operations
- ✅ Zustand for state management
- ✅ Tailwind for all styling
- ✅ React Hook Form + Zod for forms
- ✅ TypeScript interfaces for all data structures
- ✅ Error boundaries and graceful error handling
- ✅ Loading states for all async operations
- ✅ Responsive, mobile-first design
- ✅ Semantic HTML and accessibility