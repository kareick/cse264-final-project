"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageSlider } from "@/components/ui/image-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Apple } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, User, Briefcase, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setUser } = useAuth();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "About", url: "#", icon: User },
    { name: "Contact", url: "/contact", icon: Briefcase },
    { name: "Login", url: "/login", icon: FileText },
  ];

  const images = [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=60",
  ];

  // ----------------------
  // LOGIN HANDLER
  // ----------------------
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include", // allow httpOnly cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Login failed:', data);
        setError(data.error || `Login failed (${res.status})`);
        return;
      }

      // Update auth context with user data
      setUser(data.user);
      
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/portfolio";
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again.");
    }
  }

  // ----------------------
  // Animation Variants
  // ----------------------
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <div className="w-full h-screen min-h-[700px] flex items-center justify-center bg-white p-4 relative">
      <NavBar items={navItems} />

      <motion.div
        className="w-full max-w-5xl h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-black/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left: Image Slider */}
        <div className="hidden lg:block">
          <ImageSlider images={images} interval={4000} />
        </div>

        {/* Right: Login Form */}
        <div className="w-full h-full bg-white text-black flex flex-col items-center justify-center p-8 md:p-12 relative z-10">
          <motion.div
            className="w-full max-w-sm relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl font-bold tracking-tight mb-2 text-black"
            >
                Login to Your Account
            </motion.h1>
            <motion.p variants={itemVariants} className="text-black/60 mb-8">
              Welcome back to Fincrate.
            </motion.p>

            {/* OAuth Buttons */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            >
              <Button variant="outline" className="border-black/20 text-black bg-white hover:bg-gray-50">
                <Chrome className="mr-2 h-4 w-4" /> Google
              </Button>
              <Button variant="outline" className="border-black/20 text-black bg-white hover:bg-gray-50">
                <Apple className="mr-2 h-4 w-4" /> Apple
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-black/60">
                  Or continue with email
                </span>
              </div>
            </motion.div>

            {/* LOGIN FORM */}
            <motion.form
              variants={itemVariants}
              className="space-y-6 relative z-10"
              onSubmit={handleLogin}
            >
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-black/20 text-black bg-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-black/20 text-black bg-white"
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                Login
              </Button>
            </motion.form>

            {/* Success / Error Messages */}
            {error && (
              <motion.p variants={itemVariants} className="text-red-500 text-sm mt-4">
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p variants={itemVariants} className="text-green-600 text-sm mt-4">
                {success}
              </motion.p>
            )}

            {/* Footer */}
            <motion.p variants={itemVariants} className="text-center text-sm text-black/60 mt-8">
              Don't have an account?{" "}
              <a href="/register" className="font-medium text-indigo-600 hover:underline">
                Sign up
              </a>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
