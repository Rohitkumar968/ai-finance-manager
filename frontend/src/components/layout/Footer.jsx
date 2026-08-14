const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark py-4">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} AI Finance Manager . All Rights Reserved.
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Designed & Developed by <span className="font-semibold">Rohit Kumar</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;