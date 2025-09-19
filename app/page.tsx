import { Suspense } from "react"
import { GoHighLevelApp } from "@/components/gohighlevel-app"

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <GoHighLevelApp />
    </Suspense>
  )
}
