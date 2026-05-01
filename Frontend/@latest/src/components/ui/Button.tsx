import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = "rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants: Record<string, string> = {
    primary: "academic-gradient text-white shadow-lg shadow-primary/20 hover:shadow-primary/30",
    secondary: "bg-surface-low text-on-surface hover:bg-surface-lowest ghost-border",
    ghost: "bg-transparent text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
  };
  
  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
