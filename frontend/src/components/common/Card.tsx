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
      case 'primary': return 'bg-blue-50 border-blue-200';
      case 'secondary': return 'bg-gray-50 border-gray-200';
      case 'danger': return 'bg-red-50 border-red-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-white border-gray-200';
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
        <div className="card-header mb-4 pb-2 border-b border-gray-100">
          {header}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {footer && (
        <div className="card-footer mt-4 pt-2 border-t border-gray-100">
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
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="ml-4">{actions}</div>}
  </div>
);

export default Card;