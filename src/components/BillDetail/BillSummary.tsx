import React from 'react';
import type { UnifiedBill } from "@/utils/billConverters";
import { Markdown } from '../Markdown/markdown';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface BillSummaryProps {
  bill: UnifiedBill;
}

export function BillSummary({ bill }: BillSummaryProps) {
  return (
    <Card  >
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Markdown>
          {bill.summary}
        </Markdown>
      </CardContent>
    </Card>
  );
}
