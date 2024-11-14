import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background-default">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-4xl font-bold text-foreground-emphasis sm:text-6xl">
          Welcome to Courtify
        </h1>
        <p className="text-xl text-foreground-subtle">
          The modern solution for court bookings and facility management
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/signin"
            className="px-6 py-3 text-foreground-default bg-background-subtle rounded-lg border border-border-default hover:bg-background-muted transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
