import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { UnifiedBill } from "@/utils/billConverters";
import { Markdown } from "../Markdown/markdown";

const MAX_X_CHAR_COUNT = 278;

// Function to strip basic markdown formatting from text
const stripMarkdown = (text: string): string => {
  return text
    // Remove bold formatting: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic formatting: *text* or _text_
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove links: [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove inline code: `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers: # ## ###
    .replace(/^#{1,6}\s+/gm, '')
    // Remove strikethrough: ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

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

  // Build the full share text: Title + Question + URL
  const parts = [];
  
  if (sanitizedTitle) {
    parts.push(`Builder Question for ${sanitizedTitle}:`);
  }
  
  if (sanitizedQuestion) {
    parts.push(sanitizedQuestion);
  }
  
  if (sanitizedUrl) {
    parts.push(sanitizedUrl);
  }

  return parts.join("\n\n");
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
              // Use stripped markdown text for sharing to avoid clipping issues
              const strippedQuestion = stripMarkdown(trimmedQuestion);
              const shareText = buildXShareText({
                title: shareTitle,
                question: strippedQuestion,
                url: billUrl,
              });
              const xShareUrl = `https://x.com/intent/post?${new URLSearchParams({ text: shareText }).toString()}`;

              return (
                <Card key={idx} className="flex h-full flex-col">
                  <CardContent className="flex h-full flex-col justify-between gap-2">
                    <div className="prose prose-sm mt-4 flex-1 text-sm leading-6">
                      <Markdown>{strippedQuestion}</Markdown>
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
