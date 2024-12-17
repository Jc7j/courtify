'use client'

import { Component, ReactNode } from 'react'

import { Button } from '@/shared/components/ui'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class CourtsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 space-y-4">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      )
    }

    return this.props.children
  }
}
