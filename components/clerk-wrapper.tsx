"use client"

import * as ClerkNext from "@clerk/nextjs"
import React from "react"

const ClerkProvider: any = (ClerkNext as any).ClerkProvider

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
    return <ClerkProvider>{children}</ClerkProvider>
}
