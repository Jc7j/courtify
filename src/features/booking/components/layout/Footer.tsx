import { memo } from 'react'

function FooterComponent() {
  return (
    <div className="px-8 py-4 border-t mt-auto">
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Powered by Courtify. All rights reserved.
      </p>
    </div>
  )
}

export const Footer = memo(FooterComponent)
