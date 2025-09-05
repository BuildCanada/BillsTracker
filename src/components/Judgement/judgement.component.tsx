function getjudgementColor(judgement: string): string {
  switch (judgement) {
    case "yes":
      return "text-emerald-700 bg-emerald-100 border-emerald-300";
    case "no":
      return "text-rose-700 bg-rose-100 border-rose-300";
    case "neutral":
      return "text-slate-700 bg-slate-100 border-slate-300";
    default:
      return "text-slate-700 bg-slate-100 border-slate-300";
  }
}

export const Judgement = ({ judgement, }: { judgement: string, }) => {

  const ourVerdict = judgement === "yes" ? "We would vote for this" :
    judgement === "no" ? "We wouldn't vote for this" :
      "We are neutral on this bill"

  return (
    <article className={`w-fit  right-3 top-4 rounded-xl border-2 p-2  transition-all duration-300 hover:shadow-xl ${getjudgementColor(judgement)}`}>
      {/* Large Icon/Badge */}
      <div className="flex items-start gap-6">


        {/* Main Assessment Header */}
        <div className={` text-sm ${judgement === "yes" ? "text-emerald-800" :
          judgement === "no" ? "text-rose-800" :
            "text-slate-800"
          }`}>
          {ourVerdict}
        </div>


      </div>


    </article>
  );
};