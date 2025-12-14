import React, { useEffect, useState } from 'react';

export default function ThemeToggle(){
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <button className="px-3 py-1 border rounded" onClick={() => setIsDark(v => !v)}>
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}
