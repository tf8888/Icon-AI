"use client"

import { SignUp } from "@clerk/nextjs"
import React from "react"

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
            </div>
        </div>
    )
}
