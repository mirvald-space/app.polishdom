"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, GraduationCap, Home, User } from "lucide-react";

export function LMSNavigation() {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: "Курсы",
      href: "/courses",
      icon: Book,
    },
    {
      name: "Профиль",
      href: "/profile",
      icon: User,
    },
  ];
  
  return (
    <nav className="flex items-center space-x-1 lg:space-x-2">
      {navItems.map((item) => {
        const isActive = 
          item.href === "/" 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
} 