// demos/image-slider-login-demo.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ImageSlider } from "@/components/ui/image-slider"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Apple } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, User, Briefcase, FileText } from 'lucide-react';

export default function SignUp() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '#', icon: User },
    { name: 'Contact', url: '/contact', icon: Briefcase },
    { name: 'Login', url: '/signup', icon: FileText }
  ];
  const images = [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
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
        {/* Left side: Image Slider */}
        <div className="hidden lg:block">
          <ImageSlider images={images} interval={4000} />
        </div>

        {/* Right side: Login Form */}
        <div className="w-full h-full bg-white text-black flex flex-col items-center justify-center p-8 md:p-12">
          <motion.div 
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight mb-2 text-black">
              Welcome Back
            </motion.h1>
            <motion.p variants={itemVariants} className="text-black/60 mb-8">
              Enter your credentials to access your account.
            </motion.p>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button variant="outline" className="border-black/20 text-black bg-white hover:bg-gray-50">
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="border-black/20 text-black bg-white hover:bg-gray-50">
                <Apple className="mr-2 h-4 w-4" />
                Apple
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-black/60">
                  Or continue with
                </span>
              </div>
            </motion.div>

            <motion.form variants={itemVariants} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required className="border-black/20 text-black bg-white placeholder:text-gray-400" />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-black">Password</Label>
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:underline">
                        Forgot password?
                    </a>
                 </div>
                <Input id="password" type="password" required className="border-black/20 text-black bg-white placeholder:text-gray-400" />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                Log In
              </Button>
            </motion.form>

            <motion.p variants={itemVariants} className="text-center text-sm text-black/60 mt-8">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-indigo-600 hover:underline">
                Sign up
              </a>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
