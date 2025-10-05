"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Loader } from "./ui/loader";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsMenuOpen(false);
    } catch {
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 bg-[#f9fafb4a] backdrop-blur-[3px] border-b border-gray-200/60">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-base sm:text-lg font-semibold text-gray-900">Writable</span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    Dashboard
                  </Button>
                </Link>

                <Link href="/my-posts">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    My Posts
                  </Button>
                </Link>

                <Link href="/create-post">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="border border-gray-200 hover:border-orange-500 hover:text-orange-500 cursor-pointer text-gray-600 hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Create Post
                  </Button>
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader size="sm" variant="default" text="Logging out..." showText />
                  ) : (
                    <span>Logout</span>
                  )}
                </button>

                <div className="hidden sm:flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center" style={{ boxShadow: '0 0 6px #80808042, 0 0 2px #80808096' }}>
                    <span className="text-white font-semibold text-sm">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {currentUser.displayName || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {currentUser ? (
              <div className="flex flex-col space-y-2">
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                </Link>
                <Link href="/my-posts" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">My Posts</Button>
                </Link>
                <Link href="/create-post" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start"><PlusIcon className="w-4 h-4 mr-2" />Create Post</Button>
                </Link>
                <Button onClick={handleLogout} disabled={isLoggingOut} variant="ghost" className="w-full justify-start">
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Home</Button>
                </Link>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Login</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
