"use client"

import { SignIn } from "@clerk/nextjs"
import React from "react"

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
            </div>
        </div>
    )
}
