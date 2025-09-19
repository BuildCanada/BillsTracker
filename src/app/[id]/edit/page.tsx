import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";

interface Params {
  params: { id: string };
}

export default async function EditBillPage({ params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/");
  }

  const bill = await getBillByIdFromDB(params.id);
  if (!bill) {
    redirect(`/${params.id}`);
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Edit Bill</h1>
      <form
        className="space-y-6"
        action={`/bills/api/${params.id}`}
        method="post"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="title">
            Title
          </label>
          <textarea
            id="title"
            name="title"
            defaultValue={bill.title}
            className="w-full min-h-20 border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="short_title">
            Short Title
          </label>
          <textarea
            id="short_title"
            name="short_title"
            defaultValue={bill.short_title || ""}
            className="w-full min-h-20 border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="summary">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            defaultValue={bill.summary || ""}
            className="w-full min-h-32 border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="final_judgment">
            Final Judgment (yes/no/neutral)
          </label>
          <textarea
            id="final_judgment"
            name="final_judgment"
            defaultValue={bill.final_judgment || ""}
            className="w-full min-h-16 border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="rationale">
            Rationale
          </label>
          <textarea
            id="rationale"
            name="rationale"
            defaultValue={bill.rationale || ""}
            className="w-full min-h-32 border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="steel_man">
            Steel Man
          </label>
          <textarea
            id="steel_man"
            name="steel_man"
            defaultValue={bill.steel_man || ""}
            className="w-full min-h-32 border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor="missing_details"
          >
            Missing Details (comma-separated)
          </label>
          <textarea
            id="missing_details"
            name="missing_details"
            defaultValue={(bill.missing_details || []).join(", ")}
            className="w-full min-h-20 border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="genres">
            Genres (comma-separated)
          </label>
          <textarea
            id="genres"
            name="genres"
            defaultValue={(bill.genres || []).join(", ")}
            className="w-full min-h-20 border rounded p-2"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Tenet Analysis</h2>
          {(bill.tenet_evaluations || []).map((tenet, index) => {
            const idSuffix = String(index);
            return (
              <div key={index} className="border rounded p-3 space-y-3">
                <input
                  type="hidden"
                  name="tenet_id"
                  value={String(tenet.id ?? index + 1)}
                />
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium"
                    htmlFor={`tenet_title_${idSuffix}`}
                  >
                    Title
                  </label>
                  <textarea
                    id={`tenet_title_${idSuffix}`}
                    name="tenet_title"
                    defaultValue={tenet.title || ""}
                    className="w-full min-h-16 border rounded p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium"
                    htmlFor={`tenet_alignment_${idSuffix}`}
                  >
                    Alignment
                  </label>
                  <select
                    id={`tenet_alignment_${idSuffix}`}
                    name="tenet_alignment"
                    defaultValue={tenet.alignment || "neutral"}
                    className="w-full border rounded p-2"
                  >
                    <option value="aligns">aligns</option>
                    <option value="neutral">neutral</option>
                    <option value="conflicts">conflicts</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium"
                    htmlFor={`tenet_explanation_${idSuffix}`}
                  >
                    Explanation
                  </label>
                  <textarea
                    id={`tenet_explanation_${idSuffix}`}
                    name="tenet_explanation"
                    defaultValue={tenet.explanation || ""}
                    className="w-full min-h-24 border rounded p-2"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <button type="submit" className="underline">
          Save
        </button>
      </form>
    </div>
  );
}
