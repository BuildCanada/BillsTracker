// import { env } from "@/env";
// import { redirect } from "next/navigation";
// import { Suspense } from "react";
// import { connectToDatabase } from "@/lib/mongoose";
// import { User } from "@/models/User";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// function DevOnly({ children }: { children: React.ReactNode }) {
//   if (env.NODE_ENV !== "development") {
//     redirect("/");
//   }
//   return <>{children}</>;
// }

// async function createUser(formData: FormData) {
//   "use server";
//   const email = String(formData.get("email") || "").trim();
//   const name = String(formData.get("name") || "").trim() || undefined;
//   const allowed = formData.get("allowed") === "on";

//   if (!email) {
//     throw new Error("Email is required");
//   }

//   await connectToDatabase();

//   const emailLower = email.toLowerCase();
//   const existing = await User.findOne({ emailLower });
//   if (existing) {
//     if (typeof name !== "undefined") existing.name = name;
//     existing.allowed = !!allowed;
//     await existing.save();
//   } else {
//     await User.create({
//       email,
//       emailLower,
//       name: name ?? null,
//       allowed: !!allowed,
//       lastLoginAt: undefined,
//     });
//   }

//   redirect("/dev/users?ok=1");
// }

export default function DevUsersPage() {
  return (
    <div>
      howdy
      {/* <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Dev: Add User</h1>
        <form action={createUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <input id="name" name="name" type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input id="allowed" name="allowed" type="checkbox" className="h-4 w-4" />
            <label htmlFor="allowed">Allowed</label>
          </div>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">Save</button>
        </form>
        <Suspense fallback={null} />
      </main> */}
    </div>
  );
}
