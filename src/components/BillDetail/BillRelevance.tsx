import type { UnifiedBill } from "@/utils/billConverters";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Markdown } from "../Markdown/markdown";
import { Factory } from "lucide-react";
import { calculateRelevanceLevel } from "@/utils/relevance-level";

interface BillRelevanceProps {
  bill: UnifiedBill;
}

export function BillRelevance({ bill }: BillRelevanceProps) {
  if (
    typeof bill.relevance_score !== "number" ||
    !bill.relevance_justification
  ) {
    return null;
  }

  // Calculate relevance level from score if level is not set
  const relevanceLevel =
    bill.relevance_level ?? calculateRelevanceLevel(bill.relevance_score);

  // Get relevance badge styling and label
  const getRelevanceBadge = () => {
    if (!relevanceLevel) return null;

    switch (relevanceLevel) {
      case "low":
        return {
          label: "Low Relevance",
          className: "bg-gray-100 text-gray-700",
          icon: Factory,
        };
      case "medium":
        return {
          label: "Relevant",
          className: "bg-orange-100 text-orange-700",
          icon: Factory,
        };
      case "high":
        return {
          label: "Very Relevant",
          className: "bg-red-100 text-red-700",
          icon: Factory,
        };
      default:
        return null;
    }
  };

  const relevanceBadge = getRelevanceBadge();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relevance to Builders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Relevance Score:</span>
              <span className="text-lg font-semibold">
                {bill.relevance_score}/10
              </span>
            </div>
            {/* Relevance Badge - displayed at same prominence level */}
            {relevanceBadge &&
              (() => {
                const IconComponent = relevanceBadge.icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${relevanceBadge.className}`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {relevanceBadge.label}
                  </span>
                );
              })()}
          </div>
        </div>

        {bill.relevance_justification && (
          <div>
            <h4 className="text-sm font-medium mb-2">Why This Matters</h4>
            <div className="text-sm leading-6 prose prose-sm max-w-none">
              <Markdown>{bill.relevance_justification}</Markdown>
            </div>
          </div>
        )}

        {bill.gdp_impact_percent !== undefined &&
          bill.gdp_impact_percent !== null && (
            <div>
              <h4 className="text-sm font-medium mb-2">Economic Impact</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Estimated GDP Impact:</span>
                  <span className="text-sm font-semibold">
                    {bill.gdp_impact_percent.toFixed(3)}%
                  </span>
                  {bill.gdp_impact_confidence && (
                    <span className="text-xs text-muted-foreground">
                      ({bill.gdp_impact_confidence} confidence)
                    </span>
                  )}
                </div>
                {bill.gdp_impact_justification && (
                  <div className="text-sm leading-6 prose prose-sm max-w-none">
                    <Markdown>{bill.gdp_impact_justification}</Markdown>
                  </div>
                )}
              </div>
            </div>
          )}

        {bill.primary_mechanism && (
          <div>
            <h4 className="text-sm font-medium mb-2">Primary Mechanism</h4>
            <p className="text-sm">{bill.primary_mechanism}</p>
          </div>
        )}

        {bill.implementation_timeline && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Implementation Timeline
            </h4>
            <p className="text-sm">{bill.implementation_timeline}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
