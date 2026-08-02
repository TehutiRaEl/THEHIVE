import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  shadow = 'md',
  border = true,
  header,
  footer,
  className = '',
  ...props
}: CardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return 'bg-void-800 border-yale-light shadow-glow';
      case 'secondary': return 'bg-void-800 border-cyan-dim';
      case 'danger': return 'bg-void-800 border-red-500/40';
      case 'success': return 'bg-void-800 border-electric-green/40';
      case 'warning': return 'bg-void-800 border-gold-dim';
      default: return 'bg-void-800 border-void-700';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'p-3';
      case 'md': return 'p-4';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  const getShadowStyles = () => {
    switch (shadow) {
      case 'none': return '';
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      case 'xl': return 'shadow-xl';
      default: return 'shadow-md';
    }
  };

  return (
    <div
      className={`
        rounded-lg
        ${getVariantStyles()}
        ${getPaddingStyles()}
        ${getShadowStyles()}
        ${border ? 'border' : ''}
        ${hoverable ? 'transition-shadow hover:shadow-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {header && (
        <div className="card-header mb-4 pb-2 border-b border-void-700">
          {header}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {footer && (
        <div className="card-footer mt-4 pt-2 border-t border-void-700">
          {footer}
        </div>
      )}
    </div>
  );
};

// Card Header component
interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = ''
}) => (
  <div className={`flex justify-between items-start ${className}`}>
    <div className="flex-1">
      {title && <h3 className="font-display text-lg font-semibold text-cyan-glow">{title}</h3>}
      {subtitle && <p className="font-body text-sm text-white/50 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="ml-4">{actions}</div>}
  </div>
);

export default Card;