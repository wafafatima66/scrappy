"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isNative } from "@/lib/native";

// The website opens on the landing page, but the Android app should open straight into the app.
export default function NativeRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (isNative()) router.replace("/app/");
  }, [router]);
  return null;
}
