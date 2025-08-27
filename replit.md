# Overview

LocalFind is a full-stack web application for discovering and reviewing local businesses. The platform allows users to browse businesses by category, search for specific services, view detailed business information, and leave reviews. It features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and integrated Replit authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with React 18 and TypeScript, using a component-based architecture:

- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a page-component structure with reusable UI components. Key features include business discovery, detailed business views, review submission, and category filtering.

## Backend Architecture

The server is built with Express.js and TypeScript in an ESM environment:

- **API Design**: RESTful endpoints for businesses, categories, reviews, and authentication
- **Database Layer**: Storage abstraction pattern with a comprehensive interface for all data operations
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging
- **File Structure**: Modular separation of routes, database, authentication, and storage logic

## Data Storage

The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **Schema Design**: Well-structured tables for users, businesses, categories, reviews, and sessions
- **Relationships**: Proper foreign key relationships between entities
- **Migrations**: Drizzle Kit for schema migrations and database versioning
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Type Safety**: Full TypeScript integration with schema validation using Zod

Key entities include businesses with ratings aggregation, user-submitted reviews, categorized business listings, and session management for authentication.

## Authentication System

Implements Replit's OpenID Connect authentication:

- **Session Management**: PostgreSQL-based session storage with configurable TTL
- **User Management**: Automatic user creation/updates from OIDC claims
- **Security**: HTTP-only secure cookies with CSRF protection
- **Authorization**: Route-level authentication middleware for protected endpoints
- **Integration**: Seamless Replit ecosystem integration for development and deployment

## External Dependencies

- **Database**: Neon PostgreSQL for serverless database hosting
- **Authentication**: Replit OIDC for user authentication and session management
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS for utility-first styling approach
- **Icons**: Lucide React for consistent iconography
- **Development**: Replit-specific tooling for development environment integration