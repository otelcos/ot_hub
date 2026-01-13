import React, { useState, useRef, useEffect } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';

// SVG Chevron component - rotates when dropdown is open
const Chevron = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Dropdown item type
interface DropdownItem {
  to: string;
  label: string;
}

// Dropdown component with hover behavior
const Dropdown = ({ label, items }: { label: string; items: DropdownItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 200);
  };

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={styles.dropdown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={styles.dropdownToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <Chevron isOpen={isOpen} />
      </button>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {items.map((item, idx) => (
            <Link key={idx} to={item.to} className={styles.dropdownItem}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// NavLink component that detects active state
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
    >
      {children}
    </Link>
  );
};

export default function Navbar(): JSX.Element {
  return (
    <nav className={`${styles.navbar} navbar`}>
      <div className={styles.navbarInner}>
        {/* Logo & Brand */}
        <Link to="/" className={styles.brand}>
          <div className={styles.brandText}>
            <span className={styles.title}>Open Telco</span>
            <span className={styles.subtitle}>by GSMA</span>
          </div>
        </Link>

        {/* Nav Items */}
        <div className={styles.navItems}>
          <Dropdown
            label="Research"
            items={[
              { to: '/research/dashboard', label: 'Dashboard' },
              { to: '/research/benchmarks', label: 'Benchmarks' },
              { to: '/research/models', label: 'Models' },
            ]}
          />
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/docs">Documentation</NavLink>
        </div>

        {/* Right Items */}
        <div className={styles.navItemsRight}>
          <a
            href="https://github.com/gsma-research/open_telco"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
