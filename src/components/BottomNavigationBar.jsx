import { motion } from 'framer-motion';
import { History, Home, Trophy, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/players', label: 'Jugadores', icon: Users },
  { path: '/leaderboard', label: 'Ranking', icon: Trophy },
  { path: '/history', label: 'Historial', icon: History },
];

export default function BottomNavigationBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-parchment-100 dark:bg-zinc-900 border-t border-parchment-300 dark:border-zinc-800 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.5)] pb-safe transition-colors duration-300">
      <nav className="flex items-center justify-around h-20 px-2 max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 text-sm transition-colors relative",
                isActive
                  ? "text-parchment-900 dark:text-parchment-100 font-bold"
                  : "text-parchment-500 dark:text-zinc-500 hover:text-parchment-700 dark:hover:text-zinc-300"
              )
            }
          >
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center relative w-full h-full"
              >
                <item.icon className={cn("w-6 h-6 mb-1 transition-all", isActive ? "scale-110" : "")} />
                <span className="text-[10px] tracking-wide">{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
