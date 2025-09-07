import { Button } from "../Button/Button.component";
import { Card, CardContent, CardHeader } from "../Card/Card.component";

import { Calendar, User, Building } from "lucide-react";
import { Badge } from "../badge/badge.component";

export interface Bill {
  id: string;
  number: string;
  title: string;
  summary: string;
  status:
  | "introduced"
  | "committee"
  | "passed-house"
  | "passed-senate"
  | "enacted"
  | "failed";
  sponsor: {
    name: string;
    party: "Democrat" | "Republican" | "Independent";
    chamber: "House" | "Senate";
  };
  dateIntroduced: string;
  category: string;
  progress: number;
}

interface BillCardProps {
  bill: Bill;
  onViewDetails: (billId: string) => void;
}

const statusColors = {
  introduced: "bg-blue-100 text-blue-800",
  committee: "bg-yellow-100 text-yellow-800",
  "passed-house": "bg-green-100 text-green-800",
  "passed-senate": "bg-green-100 text-green-800",
  enacted: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

const statusLabels = {
  introduced: "Introduced",
  committee: "In Committee",
  "passed-house": "Passed House",
  "passed-senate": "Passed Senate",
  enacted: "Enacted",
  failed: "Failed",
};

const partyColors = {
  Democrat: "bg-blue-50 text-blue-700",
  Republican: "bg-red-50 text-red-700",
  Independent: "bg-gray-50 text-gray-700",
};

export function BillCard({
  bill,
  onViewDetails,
}: BillCardProps) {
  return (
    <Card
      className="h-full shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
      onClick={() => onViewDetails(bill.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {bill.number}
              </span>
              <Badge variant="outline" className="text-xs">
                {bill.category}
              </Badge>
            </div>
            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {bill.title}
            </h3>
          </div>
          <Badge
            className={`${statusColors[bill.status]} text-xs whitespace-nowrap`}
          >
            {statusLabels[bill.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {bill.summary}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{bill.sponsor.name}</span>
            <Badge
              className={`${partyColors[bill.sponsor.party]} text-xs`}
            >
              {bill.sponsor.party.charAt(0)}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{bill.sponsor.chamber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(
                  bill.dateIntroduced,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress
            </span>
            <span className="font-medium">
              {bill.progress}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${bill.progress}%` }}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}