"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const error = params.get("error");

  useEffect(() => {
    if (error) console.error("Sign-in error:", error);
  }, [error]);

  const onGoogle = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && (
          <div className="text-sm text-red-600">
            {error === "AccessDenied"
              ? "Your email is not allowed."
              : "Sign-in failed. Please try again."}
          </div>
        )}
        <Button disabled={loading} className="w-full" onClick={onGoogle}>
          {loading ? "Redirecting…" : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}
