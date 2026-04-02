import { Link } from "react-router-dom";

export default function Navbar({ onLogout, onOpenPreview }) {
  return (
    <header className="site-header glass-card">
      <div className="logo-group">
        <Link className="brand-link compact home-reset" to="/home">
          <div className="logo-mark">
            <img
              src="https://i.ibb.co/Y4VLxJW8/Jan-resolve.png"
              alt="Jan Resolve logo"
              className="brand-image"
            />
          </div>
          <div>
            <p className="logo-kicker">E-Governance Innovation</p>
            <h2>Jan Resolve</h2>
          </div>
        </Link>
      </div>

      <nav className="nav-bar">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#preview">Preview</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="header-actions">
        <button className="ghost-button" type="button" onClick={onOpenPreview}>
          Open Demo View
        </button>
        <button className="primary-button small" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
