# Velvet Crumbs - E-commerce Bakery Application

## Overview

Velvet Crumbs is a full-stack e-commerce application for a Sri Lankan bakery specializing in premium cakes, traditional sweets, and custom confections. The application provides a modern shopping experience with product browsing, cart management, and order functionality. Built as a monorepo with separate client and server directories, it features a React frontend with Express.js backend, PostgreSQL database, and comprehensive UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **State Management**: TanStack Query for server state management with React Context for cart state
- **UI Framework**: Radix UI components with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Build Tool**: Vite for fast development builds and hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store for cart persistence
- **Development**: TypeScript compilation with tsx for development server and esbuild for production builds

### Data Layer
- **Database**: PostgreSQL with Neon serverless adapter for cloud deployment
- **Schema**: Three main entities - categories, products, and cart items with proper foreign key relationships
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Data Initialization**: Automatic seeding of sample categories and products on first run

### Frontend State Management
- **Server State**: TanStack Query for API data fetching, caching, and synchronization
- **Client State**: React Context API for cart state management with session persistence
- **Form State**: React Hook Form with Zod validation for type-safe form handling

### UI/UX Design System
- **Component Library**: Comprehensive set of Radix UI primitives wrapped in shadcn/ui components
- **Theme System**: CSS custom properties for light/dark mode support with warm bakery-inspired color palette
- **Typography**: Multiple font families (Inter, Merriweather, Fira Code) for different content types
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints for all screen sizes

### Development Workflow
- **Type Safety**: Shared TypeScript schemas between client and server for consistent data types
- **Code Quality**: ESLint and TypeScript compiler for code quality and type checking
- **Development Server**: Vite middleware integration with Express for seamless full-stack development
- **Build Process**: Separate client (Vite) and server (esbuild) build processes for optimized production bundles

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless adapter for cloud database connectivity
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **@tanstack/react-query**: Server state management with caching, synchronization, and background updates
- **express**: Web framework for REST API endpoints and middleware
- **wouter**: Lightweight routing library for React applications

### UI and Styling Dependencies
- **@radix-ui**: Collection of accessible UI primitives for building design systems
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **lucide-react**: Icon library with consistent design and tree-shaking support
- **class-variance-authority**: Utility for creating variant-based component APIs

### Development and Build Tools
- **vite**: Fast build tool and development server with hot module replacement
- **tsx**: TypeScript execution environment for development
- **esbuild**: Fast JavaScript bundler for production builds
- **typescript**: Type system for JavaScript with compile-time type checking

### Form and Validation Libraries
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and validation schemas
- **zod**: TypeScript-first schema validation for forms and API data

### Additional Integrations
- **@stripe/stripe-js** & **@stripe/react-stripe-js**: Payment processing integration (prepared for future implementation)
- **date-fns**: Date utility library for formatting and manipulation
- **connect-pg-simple**: PostgreSQL session store for Express sessions