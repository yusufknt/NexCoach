'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ErrorBoundary (${this.props.name || 'Component'}):`, error, errorInfo)
    
    // Sentry capture can be added here
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(error, {
        tags: { boundary: this.props.name || 'Component' },
        extra: { componentStack: errorInfo.componentStack }
      })
    }).catch(() => {
      // Sentry not available
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/5 rounded-xl">
          <AlertCircle className="w-8 h-8 text-destructive mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {this.props.name ? `${this.props.name} yüklenemedi` : 'Bir hata oluştu'}
          </h3>
          <p className="text-xs text-muted-foreground text-center mb-4 max-w-xs">
            Bu bölüm yüklenirken teknik bir sorun yaşandı. Lütfen tekrar deneyin.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="h-8 text-xs"
          >
            <RefreshCcw className="w-3 h-3 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
