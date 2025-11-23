"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { InteractiveProductCard } from "@/components/ui/card-7";
import { HeroGeometric } from "@/components/ui/shape-landing-hero"


export default function Landing() {
  return (
    <>
      <HeroGeometric badge="Fincrate"
        title1="Elevate"
        title2="Your Wealth" 
      />

      <ContainerScroll
        titleComponent={
          <>
            <div className="w-full bg-white py-12 md:py-16">
              <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                  Take Control of Your Finances Now
                </h2>
                <p className="text-xl md:text-2xl text-black/70 max-w-2xl mx-auto">
                  Start tracking your investments and build wealth with confidence
                </p>
              </div>
            </div>
          </>
        }
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-6 h-full w-full p-4">
            <InteractiveProductCard
              title="Real-Time Tracking"
              description="Monitor your investments with live market data and instant updates"
              price="24/7 Updates"
              imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            />
            <InteractiveProductCard
              title="Diversified Portfolios"
              description="Build balanced portfolios across stocks, bonds, and crypto assets"
              price="Multi-Asset"
              imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            />
            <InteractiveProductCard
              title="Smart Analytics"
              description="Advanced insights and performance metrics to optimize your strategy"
              price="AI-Powered"
              imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.0.3"
            />
            <InteractiveProductCard
              title="Secure Investing"
              description="Bank-level encryption and security to protect your financial data"
              price="100% Secure"
              imageUrl="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            />
        </div>

      </ContainerScroll>

      <footer className="w-full bg-gradient-to-b from-white to-gray-400 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">Fincrate</h3>
            <p className="text-gray-600 mb-6">Elevate Your Wealth</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-sm text-gray-600">Built with</span>
              <a 
                href="https://nextjs.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center hover:opacity-80 transition-opacity"
                aria-label="Next.js"
              >
                <img src="/next.svg" alt="Next.js" className="h-5 w-auto dark:invert" />
              </a>
              <span className="text-sm text-gray-600">,</span>
              <a 
                href="https://tailwindcss.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center hover:opacity-80 transition-opacity"
                aria-label="TailwindCSS"
              >
                <svg className="h-5 w-auto" viewBox="0 0 54 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M27 0C12.1 0 0 12.1 0 27c0 14.9 12.1 27 27 27s27-12.1 27-27C54 12.1 41.9 0 27 0zm-5.4 20.25c-1.35 0-2.7-.45-3.6-1.35-.9-.9-1.35-2.25-1.35-3.6 0-1.35.45-2.7 1.35-3.6.9-.9 2.25-1.35 3.6-1.35 1.35 0 2.7.45 3.6 1.35.9.9 1.35 2.25 1.35 3.6 0 1.35-.45 2.7-1.35 3.6-.9.9-2.25 1.35-3.6 1.35zm10.8 0c-1.35 0-2.7-.45-3.6-1.35-.9-.9-1.35-2.25-1.35-3.6 0-1.35.45-2.7 1.35-3.6.9-.9 2.25-1.35 3.6-1.35 1.35 0 2.7.45 3.6 1.35.9.9 1.35 2.25 1.35 3.6 0 1.35-.45 2.7-1.35 3.6-.9.9-2.25 1.35-3.6 1.35z" fill="#06B6D4"/>
                </svg>
              </a>
            </div>
            <div className="text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Fincrate. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

