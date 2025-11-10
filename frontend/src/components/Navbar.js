const Navbar = () => {
  return (
    <header className="w-full bg-[var(--brand-50)] backdrop-blur border-b border-[var(--brand-100)]">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-8 text-[var(--brand-900)]">
          <a href="/">Home</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#transactions">Transactions</a>
          <a href="#performance">Performance</a>
        </nav>
        <nav className="flex items-center gap-6 text-[var(--brand-900)]">
          <a href="#account">Account</a>
          <button aria-label="Menu" className="p-2 rounded">
            <span className="block w-5 h-0.5 bg-[var(--brand-900)] mb-1"></span>
            <span className="block w-5 h-0.5 bg-[var(--brand-900)] mb-1"></span>
            <span className="block w-5 h-0.5 bg-[var(--brand-900)]"></span>
          </button>
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
