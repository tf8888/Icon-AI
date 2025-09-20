"use client"

import React from 'react'
import { useUser, SignOutButton, UserButton } from '@clerk/nextjs'

export function Header() {
    const { isLoaded, user } = useUser()

    if (!isLoaded) return null

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
            </div>
        </header>
    )
}

export default Header
