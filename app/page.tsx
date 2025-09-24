"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();

  const { user } = useUser();

  if (user) {
    router.push("/activity");
  } else {
    router.push("/sign-in");
  }

  return <></>;
}
