import { type ComponentType, type ReactNode } from 'react'
import { getLawColor } from '../utils/constitutional'

interface ConstitutionalBadgeProps {
  lawId: string
  children: ReactNode
}

export function ConstitutionalBadge({ lawId, children }: ConstitutionalBadgeProps) {
  return (
    <span
      title={`Protected by ${lawId}`}
      style={{
        borderLeft: `2px solid ${getLawColor(lawId)}`,
        paddingLeft: '0.5rem',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}

// HOC that wraps a component with an F-law compliance border
export function withConstitutionalCheck<P extends object>(
  WrappedComponent: ComponentType<P>,
  lawId: string
): ComponentType<P> {
  function ConstitutionalWrapper(props: P) {
    return (
      <div
        style={{
          borderTop: `1px solid ${getLawColor(lawId)}22`,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            right: 6,
            fontSize: '0.6rem',
            color: getLawColor(lawId),
            opacity: 0.6,
            fontFamily: 'monospace',
          }}
        >
          {lawId}
        </span>
        <WrappedComponent {...props} />
      </div>
    )
  }
  ConstitutionalWrapper.displayName = `Constitutional(${WrappedComponent.displayName ?? WrappedComponent.name})`
  return ConstitutionalWrapper
}

export default withConstitutionalCheck
