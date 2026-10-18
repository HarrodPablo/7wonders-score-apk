import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const variants = {
  primary: "bg-parchment-800 dark:bg-parchment-700 text-parchment-50 shadow-md shadow-parchment-900/20 border border-parchment-900/30 dark:border-parchment-600/30",
  secondary: "bg-parchment-200 dark:bg-zinc-800 text-parchment-950 dark:text-parchment-200 shadow-sm border border-parchment-400 dark:border-zinc-700",
  military: "bg-red-600 text-white shadow-md shadow-red-900/30 border border-red-700",
  civilian: "bg-blue-600 text-white shadow-md shadow-blue-900/30 border border-blue-700",
  science: "bg-green-600 text-white shadow-md shadow-green-900/30 border border-green-700",
  commercial: "bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-600/30 border border-yellow-500",
  guilds: "bg-purple-600 text-white shadow-md shadow-purple-900/30 border border-purple-700",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20",
  ghost: "bg-transparent text-parchment-800 dark:text-parchment-200 hover:bg-parchment-200 dark:hover:bg-zinc-800 shadow-none border-none",
};

const sizes = {
  sm: "py-1.5 px-3 text-sm min-h-[32px]",
  md: "py-2.5 px-5 text-base min-h-[44px]", // Base ajustado para que no sea tan tosco
  lg: "py-3 px-6 text-lg min-h-[50px] font-bold", // Acciones principales más estilizadas
};

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  disabled,
  type = 'button',
  onClick,
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.95, y: 2 } : {}}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl transition-colors duration-200 select-none",
        "focus:outline-none focus:ring-2 focus:ring-parchment-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed grayscale-[50%]",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
