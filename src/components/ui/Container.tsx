import React from 'react';
import { cn } from '../../lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const containerPadding = {
  none: '',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'xl',
  padding = 'md',
}) => {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        containerSizes[size],
        containerPadding[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;