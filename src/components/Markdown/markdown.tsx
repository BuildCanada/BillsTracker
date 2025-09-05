import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export const Markdown = ({ children }: { children: React.ReactNode }) => {
  return <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-lg font-bold text-[var(--foreground)] mb-3 mt-4 first:mt-0">{children}</h1>,
      h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-base font-semibold text-[var(--foreground)] mb-2 mt-3 first:mt-0">{children}</h2>,
      h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-sm font-medium leading-14 text-[var(--foreground)] mb-2 mt-3 first:mt-0">{children}</h3>,
      p: ({ children }: { children: React.ReactNode }) => <p className="mb-3 text-sm last:mb-0">{children}</p>,
      strong: ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-[var(--foreground)]">{children}</strong>,
      em: ({ children }: { children: React.ReactNode }) => <em className="italic">{children}</em>,
      ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-inside mb-3 space-y-1 text-sm">{children}</ul>,
      ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-sm">{children}</ol>,
      li: ({ children }: { children: React.ReactNode }) => <li className="text-[var(--muted)] text-sm">{children}</li>,
      code: ({ children }: { children: React.ReactNode }) => <code className="bg-[var(--chip-bg)] text-[var(--foreground)] px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
      pre: ({ children }: { children: React.ReactNode }) => <pre className="bg-[var(--chip-bg)] p-3 rounded mb-3 overflow-x-auto text-xs">{children}</pre>,
      blockquote: ({ children }: { children: React.ReactNode }) => <blockquote className="border-l-4 border-[var(--panel-border)] pl-4 mb-3 italic">{children}</blockquote>,
    }}
  >
    {children}
  </ReactMarkdown>
};