# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Fresh Air Education is a Next.js 15 application built with TypeScript, featuring a comprehensive UI component library with extensive table components, charts, authentication forms, drag-and-drop functionality, and dashboard analytics. The application uses React 19, Redux Toolkit for state management, and Tailwind CSS with custom styling.

## Common Commands

### Development
```bash
# Start development server on port 4080 with Turbopack
yarn dev

# Build for production with Turbopack
yarn build

# Start production server
yarn start

# Run linting
yarn lint
```

### Package Management
```bash
# Install dependencies (project uses Yarn)
yarn install

# Add new dependency
yarn add <package>

# Add new dev dependency
yarn add -D <package>
```

## Architecture Overview

### Application Structure
- **App Router**: Uses Next.js 15 App Router with pages in `src/app/`
- **Component Architecture**: Modular component system organized by functionality
- **State Management**: Redux Toolkit with centralized store and theme configuration slice
- **Styling**: Tailwind CSS with custom color scheme and extensive UI components
- **Internationalization**: Custom i18n implementation (currently English, with Romanian planned)

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components organized by category
- `src/providers/` - React context providers for app state and theming  
- `src/store/` - Redux store configuration and slices
- `database/` - Database schema and diagrams

### State Management Pattern
The application uses a provider pattern with multiple layers:
1. **BaseProvider** - Wraps app with Redux store and suspense boundaries
2. **AppProvider** - Handles theme configuration, localStorage persistence, and i18n
3. **Redux Store** - Centralized state with theme configuration slice

### Component Organization
Components are organized by functionality:
- `auth/` - Authentication forms (login, register, reset password)
- `charts/` - ApexCharts components (area, bar, donut, line, etc.)
- `dashboard/` - Dashboard analytics and data visualization
- `datatables/` - Advanced table components with sorting, filtering, pagination
- `dragndrop/` - Drag and drop functionality components
- `layouts/` - Application layout components and providers

### Styling Architecture
- **Tailwind CSS**: Primary styling framework with extensive custom configuration
- **Custom Color System**: Comprehensive color palette with light/dark theme support
- **Typography**: Nunito font family with custom typography settings
- **Component Variants**: Contextual styling for tables, buttons, and UI elements

### Configuration Management
- **Theme Config**: Centralized theme configuration with localStorage persistence
- **TypeScript Paths**: Organized import aliases (`@faComponents/*`, `@faProviders/*`, `@fa/*`)
- **Development Tools**: ESLint with Next.js config, Prettier for formatting

## Development Guidelines

### Path Aliases
The project uses TypeScript path mapping for clean imports:
- `@faLayouts/*` → `./src/components/layouts/*`
- `@faComponents/*` → `./src/components/*` 
- `@faProviders/*` → `./src/providers/*`
- `@fa/*` → `./src/*`
- `@/*` → `./src/*`

### Component Patterns
- Components follow a modular architecture with clear separation of concerns
- State management through Redux for global state, local state for component-specific data
- Extensive use of TypeScript interfaces and type safety
- Consistent naming convention: `components-[category]-[name].tsx`

### Theme System
The application supports:
- Multiple theme modes (light, dark, system)
- RTL/LTR layout support
- Various layout options (full, boxed)
- Multiple menu styles (vertical, horizontal, collapsible)
- Animation preferences with animate.css integration

### Data Visualization
Heavy use of ApexCharts for data visualization with components for:
- Area, bar, bubble, column charts
- Donut, pie, polar area charts  
- Line, mixed, radar, radial bar charts
- Dashboard-specific analytics components

### Development Port
The development server runs on **port 4080** (not the default 3000) as configured in package.json.

## Database
The project includes database schema documentation in `database/dbdiagram.txt` for understanding data relationships.
