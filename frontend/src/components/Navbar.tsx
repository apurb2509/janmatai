import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import logo from '../assets/janmatai_logo.png';

const NavWrapper = styled.div`
  position: fixed;
  top: 1rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
`;

const NavContainer = styled(motion.nav)`
  padding: 0.75rem 2rem;
  background: rgba(20, 20, 20, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  display: flex;
  align-items: center;
  gap: 3rem;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-right: 1rem;
`;

const LogoImage = styled.img`
  width: 32px;
  height: 32px;
`;

const LogoText = styled.div`
  font-weight: 700;
  font-size: 1.5rem;
  color: #fff;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 3rem;
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 0.5rem;
  width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DropdownItem = styled.a`
  display: block;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 4px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const AuthButton = styled(motion.button)`
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #00FFFF;
  background: transparent;
  color: #00FFFF;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
`;

const UserProfileContainer = styled.div`
  position: relative;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #00FFFF;
  cursor: pointer;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  top: 120%;
  right: 0;
  background: rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  width: max-content;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
`;

const TooltipText = styled.div`
  white-space: nowrap;
  &:first-child {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }
`;

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  setActivePage: (page: 'home' | 'about') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, setActivePage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <NavWrapper>
      <NavContainer
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <LogoContainer onClick={() => setActivePage('home')}>
          <LogoImage src={logo} alt="Janmat AI Logo" />
          <LogoText>Janmat AI</LogoText>
        </LogoContainer>
        <NavLinks>
          <NavLink onClick={() => setActivePage('home')}>Home</NavLink>
          <NavLink onClick={() => setActivePage('about')}>About</NavLink>
          <DropdownContainer ref={dropdownRef}>
            <NavLink onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              Features
            </NavLink>
            <AnimatePresence>
              {isDropdownOpen && (
                <DropdownMenu
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <DropdownItem>Live Narrative Map</DropdownItem>
                  <DropdownItem>Datewise Sorting</DropdownItem>
                  <DropdownItem>Clustering</DropdownItem>
                  <DropdownItem>Live Data Ingestion</DropdownItem>
                  <DropdownItem>AxiomBot (RAG-chatbot)</DropdownItem>
                </DropdownMenu>
              )}
            </AnimatePresence>
          </DropdownContainer>
        </NavLinks>
        {user ? (
          <UserProfileContainer 
            onMouseEnter={() => setIsTooltipVisible(true)} 
            onMouseLeave={() => setIsTooltipVisible(false)}
          >
            <UserProfile>
              <UserAvatar src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AuthButton
                onClick={onLogout}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 0, 0, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                style={{ borderColor: '#FF0000', color: '#FF0000' }}
              >
                Logout
              </AuthButton>
            </UserProfile>
            <AnimatePresence>
              {isTooltipVisible && (
                <Tooltip
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <TooltipText>{user.displayName}</TooltipText>
                  <TooltipText>{user.email}</TooltipText>
                </Tooltip>
              )}
            </AnimatePresence>
          </UserProfileContainer>
        ) : (
          <AuthButton
            onClick={handleLogin}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </AuthButton>
        )}
      </NavContainer>
    </NavWrapper>
  );
};