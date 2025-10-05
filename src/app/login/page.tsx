"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ButtonLoader } from "@/components";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { login } = useAuth();
  const router = useRouter();
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const fullText = "Welcome to Your Journey";
  const subtitleText = "Discover stories that inspire, educate, and transform. Join our community of mindful readers exploring the art of living well.";

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 90);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image and Text */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden justify-center items-center bg-orange-500">
        <div className="flex flex-col justify-center items-center text-white p-12 text-center z-10">
          <div className="max-w-md">
            <h1 
              ref={titleRef}
              className="text-4xl xl:text-5xl font-extrabold mb-6 leading-tight min-h-[120px] flex items-center justify-center"
            >
              {displayedText}
            </h1>
            <p 
              ref={subtitleRef}
              className="text-lg xl:text-xl text-white/90 leading-relaxed mb-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}
            >
              {subtitleText}
            </p>
            <div 
              className="flex items-center justify-center space-x-4 text-white/80 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '3s', animationFillMode: 'forwards' }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">New</div>
                <div className="text-sm">Platform</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">Fresh</div>
                <div className="text-sm">Content</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">Growing</div>
                <div className="text-sm">Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 ">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <ButtonLoader text="Signing in..." />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign up here
              </a>
            </p>
          </div>

          <div className="mt-8">
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div> */}

            {/* <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-11 rounded-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
