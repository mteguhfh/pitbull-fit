import React from 'react';

export type CardVariant = 'default' | 'raised' | 'accent' | 'flat';
export type CardRadius = 'card' | 'sheet';

interface CardProps {
  variant?: CardVariant;
  radius?: CardRadius;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: 'border border-line',
  raised: 'border border-line shadow-card',
  accent: 'border border-accent/40',
  flat: 'border border-transparent',
};

const RADIUS_PX: Record<CardRadius, string> = {
  card: '20px',
  sheet: '28px',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  radius = 'card',
  padding = '16px',
  className = '',
  style,
  children,
  onClick,
}) => (
  <div
    className={`bg-surface ${VARIANT_CLASS[variant]} ${className}`}
    style={{ padding, borderRadius: RADIUS_PX[radius], ...style }}
    onClick={onClick}
  >
    {children}
  </div>
);
