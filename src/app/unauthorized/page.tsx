import Link from "next/link";
import { BASE_PATH } from "@/utils/basePath";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <h1 className="text-xl font-semibold">Sorry! </h1>
      <p className="mt-2 text-sm">You don’t have access to view this page.</p>
      <div className="mt-4 space-x-4">
        <Link className="underline text-sm" href={BASE_PATH || "/"}>
          Go home
        </Link>
      </div>
    </div>
  );
}
