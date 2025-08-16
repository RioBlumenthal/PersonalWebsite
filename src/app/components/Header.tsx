"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa6";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-title">Rio Blumenthal</div>
      <nav className="nav">
        <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
          Home
        </Link>
        <Link href="/resume" className={`nav-link ${pathname === "/resume" ? "active" : ""}`}>
          Resume
        </Link>
        <Link href="/projects" className={`nav-link ${pathname === "/projects" ? "active" : ""}`}>
          Projects
        </Link>
        <Link href="/tools" className={`nav-link ${pathname === "/tools" ? "active" : ""}`}>
          Tools
        </Link>
        <Link href="/games" className={`nav-link ${pathname === "/games" ? "active" : ""}`}>
          Games
        </Link>
      </nav>
      <div className="header-spacer">
        <div className="social-icons">
          <a href="https://www.instagram.com/yarglewithwings/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram className="social-icon" />
          </a>
          <a href="https://github.com/RioBlumenthal" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub className="social-icon" />
          </a>
          <a href="https://www.linkedin.com/in/rio-blumenthal/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin className="social-icon" />
          </a>
        </div>
      </div>
    </header>
  );
} 