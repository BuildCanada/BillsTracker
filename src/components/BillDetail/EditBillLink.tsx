"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

interface EditBillLinkProps {
  id: string;
}

export function EditBillLink({ id }: EditBillLinkProps) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <Link href={`/${id}/edit`} className="ml-4 text-sm underline">
      Edit
    </Link>
  );
}
