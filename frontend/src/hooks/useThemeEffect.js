import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Applies the current theme (light/dark) to the <html> element
 * so Tailwind's `dark:` variants take effect app-wide.
 */
const useThemeEffect = () => {
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
};

export default useThemeEffect;
