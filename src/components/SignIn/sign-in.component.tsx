'use client'
import { signIn } from "next-auth/react";


export const SignIn = () => {

  const handleSignInClick = () => {
    signIn("google");
  }
  return (
    <div>
      <p className="text-xs text-[var(--muted-foreground)] cursor-pointer" onClick={handleSignInClick}>
        Admin
      </p>
    </div>
  )
}