"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import BarChart from "./icon/BarChart";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavBar() {
    return (
        <div className="relative w-full flex items-center justify-center">
            <Navbar className="top-4" />
        </div>
    );
}

function Navbar({ className }: { className?: string }) {
    const [active, setActive] = useState<string | null>(null);
    const pathname = usePathname(); // Get the current path

    const links = [
        { href: '/', label: <BarChart /> },
        { href: '/reports/projected-rebill-revenue', label: 'Projected Rebill Revenue' },
        { href: '/reports/total-vip-tracking', label: 'Total VIP Tracking' },
        { href: '/reports/upsell-take-rate-report', label: 'Upsell Take Rate Report' },
    ];
    return (
        <div
            className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
        >
            <Menu setActive={setActive} >
                <section id="navBar">
                    <ul className="flex items-center gap-4 text-base font-semibold">
                        {links.map(({ href, label }) => (
                            <li key={href} >
                                <Link href={href} className={pathname === href ? styles.activeLink : styles.link} >{label}</Link>
                            </li>
                        ))}

                        <li></li>
                    </ul>
                </section>
            </Menu>
        </div>
    );
}

const styles = {
    activeLink: "text-[#E6151C] hover:underline",
    link: "text-[#F1D302] hover:underline"
}