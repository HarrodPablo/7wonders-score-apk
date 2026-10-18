import React from 'react';
import BottomNavigationBar from './BottomNavigationBar';

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen bg-parchment-100 dark:bg-zinc-900 transition-colors duration-300">
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigationBar />
    </div>
  );
}
