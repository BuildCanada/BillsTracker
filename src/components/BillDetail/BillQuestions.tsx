import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { UnifiedBill } from "@/utils/billConverters";
import { Markdown } from "../Markdown/markdown";

const MAX_X_CHAR_COUNT = 278;

const XLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    role="img"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      d="M3.5 3h4.89l3.75 5.63L16.78 3H21l-6.01 7.91L21.5 21h-4.89l-4.05-6.07L7.22 21H3l6.37-8.39L3.5 3Z"
      fill="currentColor"
    />
  </svg>
);

const buildXShareText = ({
  title,
  question,
  url,
}: {
  title: string;
  question: string;
  url: string;
}) => {
  const sanitizedTitle = title?.trim() ?? "";
  const sanitizedQuestion = question?.trim() ?? "";
  const sanitizedUrl = url?.trim() ?? "";

  const prefixes: string[] = [];
  if (sanitizedTitle) {
    prefixes.push(`Builder Question for ${sanitizedTitle}:`);
  }
  prefixes.push("Builder Question:");
  prefixes.push("");

  const buildShareString = (prefix: string, body: string, link: string) => {
    const segments = [prefix, body, link].filter((segment) => segment.length);
    return segments.join("\n\n");
  };

  for (const prefix of prefixes) {
    const hasQuestion = sanitizedQuestion.length > 0;

    if (!hasQuestion) {
      const shareCandidate = buildShareString(prefix, "", sanitizedUrl);
      if (shareCandidate.length && shareCandidate.length <= MAX_X_CHAR_COUNT) {
        return shareCandidate;
      }
      continue;
    }

    const questionSegmentsCount = (prefix ? 1 : 0) + 1 + (sanitizedUrl ? 1 : 0);
    const separatorsLength = Math.max(0, questionSegmentsCount - 1) * 2;
    const available =
      MAX_X_CHAR_COUNT -
      (prefix.length + sanitizedUrl.length + separatorsLength);

    if (available <= 0) {
      continue;
    }

    let truncatedQuestion = sanitizedQuestion;
    if (truncatedQuestion.length > available) {
      if (available === 1) {
        truncatedQuestion = truncatedQuestion.slice(0, 1);
      } else {
        truncatedQuestion = `${truncatedQuestion
          .slice(0, available - 1)
          .trimEnd()}…`;
      }
    }

    const shareCandidate = buildShareString(
      prefix,
      truncatedQuestion,
      sanitizedUrl,
    );

    if (shareCandidate.length <= MAX_X_CHAR_COUNT) {
      return shareCandidate;
    }
  }

  if (sanitizedUrl.length > MAX_X_CHAR_COUNT) {
    return sanitizedUrl.slice(0, MAX_X_CHAR_COUNT);
  }

  return sanitizedUrl || "";
};

export const BillQuestions = ({
  bill,
  billUrl,
}: {
  bill: UnifiedBill;
  billUrl: string;
}) => {
  const questions = bill.question_period_questions ?? [];
  const shareTitle = bill.short_title || bill.title;

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Question Period Cards</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => {
              const trimmedQuestion = q.question?.trim() ?? "";
              const shareText = buildXShareText({
                title: shareTitle,
                question: trimmedQuestion,
                url: billUrl,
              });
              const xShareUrl = `https://x.com/intent/post?${new URLSearchParams({ text: shareText }).toString()}`;

              return (
                <Card key={idx} className="flex h-full flex-col">
                  <CardContent className="flex h-full flex-col justify-between gap-2">
                    <div className="prose prose-sm mt-4 flex-1 text-sm leading-6">
                      <Markdown>{trimmedQuestion}</Markdown>
                    </div>
                    <div className="flex flex-col justify-end gap-2 text-sm">
                      <a
                        href={xShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-end gap-1 text-sm font-medium text-primary hover:text-primary/80"
                      >
                        Share on <XLogo className="size-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
