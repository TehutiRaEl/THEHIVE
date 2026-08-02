import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary': return 'bg-yale hover:bg-yale-light text-white shadow-glow';
        case 'secondary': return 'bg-void-700 hover:bg-void-800 text-cyan-glow border border-cyan-dim';
        case 'danger': return 'bg-red-900 hover:bg-red-800 text-white border border-red-500/40';
        case 'ghost': return 'bg-transparent hover:bg-void-700 text-cyan-glow border border-cyan-dim';
        case 'text': return 'bg-transparent hover:bg-void-700 text-cyan-glow';
        default: return 'bg-yale hover:bg-yale-light text-white shadow-glow';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm': return 'px-3 py-1.5 text-sm';
        case 'md': return 'px-4 py-2 text-base';
        case 'lg': return 'px-6 py-3 text-lg';
        default: return 'px-4 py-2 text-base';
      }
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          font-body font-medium rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-cyan-glow focus:ring-offset-2 focus:ring-offset-void-900
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getVariantStyles()}
          ${getSizeStyles()}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;