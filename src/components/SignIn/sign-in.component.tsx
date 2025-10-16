import Link from "next/link";

export const SignIn = () => {
  return (
    <div>
      <p className="text-xs text-[var(--muted-foreground)] cursor-pointer">
        <Link href={"/sign-in"}>Admin</Link>
      </p>
    </div>
  );
};
