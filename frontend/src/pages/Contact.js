"use client";

import * as React from "react";
import { TestimonialSlider } from "@/components/ui/testimonial-slider-1";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { BeamsBackground } from "@/components/ui/beams-background";
import { Home, User, Briefcase, FileText } from 'lucide-react';

const Contact = () => {
    const navItems = [
        { name: 'Home', url: '/', icon: Home },
        { name: 'About', url: '#', icon: User },
        { name: 'Contact', url: '/contact', icon: Briefcase },
        { name: 'Login', url: '/signup', icon: FileText }
    ];

    // Team member data
    const teamMembers = [
        {
            id: 1,
            name: "Kerrick Truong",
            affiliation: "Full Stack Developer",
            quote:
                "Passionate about building scalable web applications and creating seamless user experiences. I focus on clean code and efficient solutions.",
            imageSrc: "/kerrick.jpg",
            thumbnailSrc: "/kerrick.jpg",
        },
        {
            id: 2,
            name: "Christian Reichert",
            affiliation: "Backend Engineer",
            quote:
                "Specializing in robust API design and database architecture. I ensure our platform handles data securely and efficiently at scale.",
            imageSrc: "/christian.jpg",
            thumbnailSrc: "/christian.jpg",
        },
        {
            id: 3,
            name: "Nadxieli Jimenez Bielma",
            affiliation: "Frontend Developer",
            quote:
                "Crafting beautiful and intuitive interfaces with attention to detail. I bring designs to life with modern web technologies and best practices.",
            imageSrc: "/nadxieli.jpg",
            thumbnailSrc: "/nadxieli.jpg",
        },
    ];
    return (
        <div className="w-full min-h-screen flex flex-col relative">
            <div className="absolute inset-0 z-0">
                <BeamsBackground className="bg-white" />
            </div>
            <div className="relative z-10">
                <NavBar items={navItems} />
                <div className="flex-1 flex flex-col pt-20">
                    <div className="text-center py-8 md:py-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
                            Meet the Team
                        </h1>
                    </div>
                    <div className="flex-1 w-full">
                        <TestimonialSlider reviews={teamMembers} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;