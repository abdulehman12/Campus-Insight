interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'lowest' | 'low' | 'high';
}

const Card = ({ children, className = '', variant = 'lowest' }: CardProps) => {
  const bgClass = {
    lowest: 'bg-surface-lowest',
    low: 'bg-surface-low',
    high: 'bg-surface-container-high',
  }[variant];

  return (
    <div className={`rounded-3xl ${bgClass} transition-all duration-300 p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
