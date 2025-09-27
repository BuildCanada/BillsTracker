"use client";
import { signIn } from "next-auth/react";
import { BASE_PATH } from "@/utils/basePath";

export const SignIn = () => {
  const handleSignInClick = () => {
    signIn("google", { callbackUrl: BASE_PATH || "/" });
  };
  return (
    <div>
      <p
        className="text-xs text-[var(--muted-foreground)] cursor-pointer"
        onClick={handleSignInClick}
      >
        Admin
      </p>
    </div>
  );
};
