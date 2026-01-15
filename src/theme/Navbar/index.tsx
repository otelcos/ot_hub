import React, { useState, useRef, useEffect } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';

// Hamburger icon for mobile menu
const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`${styles.hamburgerIcon} ${isOpen ? styles.hamburgerOpen : ''}`}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line className={styles.hamburgerLine1} x1="3" y1="6" x2="21" y2="6" />
    <line className={styles.hamburgerLine2} x1="3" y1="12" x2="21" y2="12" />
    <line className={styles.hamburgerLine3} x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

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

// Inline Theta letter for use in "Θpen Telco" text
const ThetaLetter = () => (
  <svg
    className={styles.thetaInline}
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="10" cy="12" rx="8" ry="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <line x1="2" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default function Navbar(): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Listen for scroll on any element using capture phase
  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Get scroll position from the event target (the actual scrolling element)
      const target = e.target as Element | Document;
      let scrollY = 0;

      if (target === document || target === document.documentElement) {
        scrollY = window.scrollY || document.documentElement.scrollTop;
      } else if (target instanceof Element) {
        scrollY = target.scrollTop;
      }

      setIsCollapsed(scrollY > 50);
    };

    // Use capture phase to catch scroll events from any element
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    // Initial check - find any scrolled container
    const checkInitialScroll = () => {
      const scrollY = window.scrollY ||
        document.documentElement.scrollTop ||
        (document.querySelector('[class*="main"]')?.scrollTop ?? 0);
      setIsCollapsed(scrollY > 50);
    };
    checkInitialScroll();

    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`navbar ${styles.navbar}`}>
        <div className={styles.navbarInner}>
        {/* Logo & Brand with collapse animation */}
        <Link to="/" className={`${styles.brand} ${isCollapsed ? styles.brandCollapsed : ''}`}>
          {/* Animated logo text - individual spans for smooth morphing */}
          <div className={styles.logoText}>
            {/* Θ - stays fixed */}
            <span className={styles.letterTheta}>
              <ThetaLetter />
            </span>

            {/* "pen" - fades out and collapses */}
            <span className={`${styles.letterPen} ${isCollapsed ? styles.letterPenCollapsed : ''}`}>
              pen
            </span>

            {/* Space - collapses */}
            <span className={`${styles.letterSpace} ${isCollapsed ? styles.letterSpaceCollapsed : ''}`}>
              {' '}
            </span>

            {/* T - slides left */}
            <span className={`${styles.letterT} ${isCollapsed ? styles.letterTSlide : ''}`}>
              T
            </span>

            {/* "elco" - fades out */}
            <span className={`${styles.letterFade} ${isCollapsed ? styles.letterFadeOut : ''}`}>
              elco
            </span>
          </div>

          {/* Subtitle - fades out */}
          <span className={`${styles.subtitle} ${isCollapsed ? styles.subtitleHidden : ''}`}>
            by <span className={styles.gsmaHighlight}>GSMA</span>
          </span>
        </Link>

        {/* Nav Items */}
        <div className={styles.navItems}>
          <Dropdown
            label="Research"
            items={[
              { to: '/dashboards', label: 'Dashboard' },
              { to: '/benchmarks', label: 'Benchmarks' },
              { to: '/models', label: 'Models' },
            ]}
          />
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/docs">Documentation</NavLink>
        </div>

        {/* Right Items */}
        <div className={styles.navItemsRight}>
          <a
            href="https://github.com/otelcos/evals"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className={styles.hamburgerButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <HamburgerIcon isOpen={isMobileMenuOpen} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
      >
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>Menu</span>
          <button
            className={styles.mobileCloseButton}
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.mobileMenuContent}>
          {/* Research Section */}
          <div className={styles.mobileMenuSection}>
            <span className={styles.mobileMenuLabel}>Research</span>
            <Link to="/dashboards" className={styles.mobileMenuItem} onClick={closeMobileMenu}>
              Dashboard
            </Link>
            <Link to="/benchmarks" className={styles.mobileMenuItem} onClick={closeMobileMenu}>
              Benchmarks
            </Link>
            <Link to="/models" className={styles.mobileMenuItem} onClick={closeMobileMenu}>
              Models
            </Link>
          </div>

          {/* Main Links */}
          <div className={styles.mobileMenuSection}>
            <Link to="/leaderboard" className={styles.mobileMenuItem} onClick={closeMobileMenu}>
              Leaderboard
            </Link>
            <Link to="/docs" className={styles.mobileMenuItem} onClick={closeMobileMenu}>
              Documentation
            </Link>
          </div>

          {/* External Links */}
          <div className={styles.mobileMenuSection}>
            <a
              href="https://github.com/otelcos/evals"
              className={styles.mobileMenuItem}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
            >
              GitHub
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.5rem' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
