"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const error = params.get("error");
  const callbackUrl = params.get("callbackUrl") || "/";

  useEffect(() => {
    if (error) console.error("Sign-in error:", error);
  }, [error]);

  useEffect(() => {
    // Redirect if already signed in
    if (status === "authenticated" && session?.user) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const onGoogle = async () => {
    try {
      setLoading(true);
      const result = await signIn("google", {
        callbackUrl,
        redirect: false
      });

      if (result?.error) {
        console.error("Sign-in error:", result.error);
        setLoading(false);
      } else if (result?.url) {
        // Successful sign-in, redirect
        router.push(result.url);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && (
          <div className="text-sm text-red-600">
            {error === "AccessDenied" ? "Your email is not allowed." : "Sign-in failed. Please try again."}
          </div>
        )}
        <Button disabled={loading} className="w-full" onClick={onGoogle}>
          {loading ? "Redirecting…" : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}

