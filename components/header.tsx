"use client";

import React from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const { isLoaded, user } = useUser();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getThemeIcon = () => {
    return theme === "light" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  if (!isLoaded) return null;

  return (
    <header className="w-full bg-card border-b  px-4 py-2 flex items-center justify-end">
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* <div className="text-sm  text-right">
                            <div>{user.firstName || user.fullName || user.primaryEmailAddress?.emailAddress}</div>
                            <div className="text-xs ">{user.emailAddresses?.[0]?.emailAddress}</div>
                        </div> */}
            <UserButton />
            {/* <SignOutButton>
                            <button className="px-3 py-1 text-sm rounded bg-red-50 text-red-600">Sign out</button>
                        </SignOutButton> */}
          </>
        ) : (
          <div className="text-sm text-gray-600">Not signed in</div>
        )}
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleThemeChange}
          className={`h-12 w-12 p-0 justify-center mx-auto`}
        >
          {getThemeIcon()}
        </Button>
      </div>
    </header>
  );
}

export default Header;
