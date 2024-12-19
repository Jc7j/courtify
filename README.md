# Courtify

Courtify is a modern court rental booking system designed for sports facilities, particularly volleyball courts. It provides a company-specific booking experience with dynamic branding, court management, customizable pricing, and an admin dashboard.

## Getting Started

### Prerequisites
- Node.js v20.x or higher
- Bun v1.0.x or higher (recommended for faster development)
- Supabase CLI
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/courtify.git

# Install dependencies using bun (recommended)
bun install

# Or using npm
npm install
```

## Environment Setup

### Node.js Version
We recommend using Node.js v20.x or higher. You can manage Node.js versions using nvm:
```bash
nvm install 20.11.1

nvm use 20.11.1

```

### Using Bun
Bun is recommended for faster development experience:
```bash
# Install bun globally
curl -fsSL https://bun.sh/install | bash

# Use bun for development
bun dev
```

## First Time Configuration

### 1. Supabase Local Development
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# Run migrations
supabase db push
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Stripe Test Data
1. Create a Stripe account and get API keys
2. Enable test mode in Stripe Dashboard
3. Configure webhook endpoints for local development

### 4. Resend Setup
1. Create a Resend account
2. Get API key from dashboard
3. Configure email templates

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (booking)/         # Public booking routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── core/                  # Core business logic
│   ├── company/          # Company management
│   └── user/             # User management
├── features/             # Feature-based modules
│   ├── availability/     # Court availability
│   ├── booking/         # Booking system
│   ├── courts/          # Court management
│   ├── settings/        # Settings management
│   └── stripe/          # Stripe integration
└── shared/              # Shared utilities and components
    ├── components/      # Reusable UI components
    ├── hooks/          # Custom React hooks
    ├── lib/            # Utility functions
    └── types/          # TypeScript types
```

The project follows a modular architecture:
- `app/`: Next.js pages and API routes
- `core/`: Essential business logic and data management
- `features/`: Self-contained feature modules
- `shared/`: Reusable utilities and components
