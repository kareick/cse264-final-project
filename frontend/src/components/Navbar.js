const Navbar = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-10 h-10 rounded-full"
        />
        <h1 className="text-xl font-semibold"> Fincrate </h1>
      </div>

      {/* Navigation Links */}
      <nav className="space-x-6">
        <a href="/" className="hover:text-gray-300">
          Home
        </a>
        <a href="/about" className="hover:text-gray-300">
          About
        </a>
        <a href="/contact" className="hover:text-gray-300">
          Contact
        </a>
      </nav>

      {/* Secondary Nav / Actions */}
      <nav className="space-x-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
          Login
        </button>
        <button className="border border-white px-3 py-1 rounded hover:bg-white hover:text-gray-800">
          Sign Up
        </button>
      </nav>
    </header>
  );
};
export default Navbar;