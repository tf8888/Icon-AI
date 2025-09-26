"use client";

import Vapi from "@vapi-ai/web";

let vapiSingleton: Vapi | null = null;

export function getVapiClient(): Vapi {
  if (typeof window === "undefined") {
    throw new Error("Vapi Web SDK can only be used in the browser");
  }

  if (!vapiSingleton) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set");
    }
    vapiSingleton = new Vapi(publicKey);
  }

  return vapiSingleton;
}


