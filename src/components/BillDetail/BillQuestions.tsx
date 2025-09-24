import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { UnifiedBill } from "@/utils/billConverters";
import { Markdown } from "../Markdown/markdown";

export const BillQuestions = ({ bill }: { bill: UnifiedBill }) => {
  const questions = bill.question_period_questions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Period Cards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {questions.map((q) => {
            return (
              <div className="text-sm leading-6 prose prose-sm max-w-none">
                <Markdown>{q.question}</Markdown>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};