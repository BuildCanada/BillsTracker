import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";

interface BillContactProps {
  className?: string;
}

export function BillContact({ className }: BillContactProps) {
  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="space-y-2 text-sm p-4 md:p-6">
        <p className="font-medium text-[var(--foreground)]">Questions or concerns?</p>
        <p className="text-[var(--muted-foreground)]">
          Email
          {" "}
          <a
            href="mailto:hi@buildcanada.com"
            className="underline underline-offset-2 hover:text-[var(--foreground)] transition-colors"
          >
            hi@buildcanada.com
          </a>
        </p>
      </CardContent>
    </Card>
  );
}


