"use client";

import React from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

export function Header() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return null;

  return (
    <header className="w-full bg-card border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-lg font-bold md:hidden">Stratos AI</h1>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <UserButton />
          </>
        ) : (
          <div className="text-sm text-gray-600">Not signed in</div>
        )}
      </div>
    </header>
  );
}

export default Header;
