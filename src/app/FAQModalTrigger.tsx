"use client";

import { useEffect, useRef, useState } from "react";

export default function FAQModalTrigger() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  function openModal() {
    setMounted(true);
    // Ensure the element is mounted before starting the transition
    requestAnimationFrame(() => setVisible(true));
  }

  function closeModal() {
    setVisible(false);
    // Wait for exit animation to finish before unmounting
    window.setTimeout(() => {
      setMounted(false);
      buttonRef.current?.focus();
    }, 200);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (mounted) {
      document.addEventListener("keydown", onKeyDown);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prev;
      };
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted && visible && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [mounted, visible]);

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) closeModal();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="mt-3 inline-block cursor-pointer text-xs underline text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        onClick={openModal}
      >
        FAQ
      </button>

      {mounted && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
          <div
            onClick={onBackdropClick}
            className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-title"
            tabIndex={-1}
            className={`relative z-10 w-full max-w-2xl rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-5 shadow-xl outline-none transition-all duration-200 ease-out ${
              visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-95"
            }`}
          >
            <div className="flex items-start justify-between">
              <h2 id="faq-title" className="text-[24px] font-semibold">
                Frequently Asked Questions
              </h2>
              <button
                type="button"
                aria-label="Close"
                className="ml-3 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-sm leading-6">
              <h3 className="font-semibold">Why did you build this?</h3>
              <p className="text-[var(--text-secondary)] mt-1">
                We built this tool so that Canadians could easily understand
                parliamentary bills and how they align with a pro-growth stance.
              </p>

              <h3 className="font-semibold mt-4">
                Where does the bill data come from?
              </h3>
              <p className="text-[var(--text-secondary)] mt-1">
                We are powered by{" "}
                <a
                  href="https://civicsproject.org"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  The Civics Project
                </a>
                , which pulls data from the Government of Canada's open
                parliamentary data feeds.
              </p>

              <h3 className="font-semibold mt-4">
                How do you determine a bill's judgement?
              </h3>
              <p className="text-[var(--text-secondary)] mt-1">
                Each bill is evaluated against a set of pro-growth principles
                using an LLM. The LLM uses these principles to make a judgement
                on the bill. We show all of this, including the principles,
                evaluation and rationale, on the bill's page.
              </p>

              <h3 className="font-semibold mt-4">
                Was this tool created to vote on bills?
              </h3>
              <p className="text-[var(--text-secondary)] mt-1">
                No. This tool was created to help Canadians better understand
                bills and their economic impact. It is meant to be educational
                and informative.
              </p>

              <h3 className="font-semibold mt-4">
                What prompt do you use to evaluate the bills?
              </h3>
              <p className="text-[var(--text-secondary)] mt-1">
                This project, including the prompt, is open sourced on{" "}
                <a
                  className="underline"
                  href="https://github.com/BuildCanada/BillsTracker/blob/main/src/prompt/summary-and-vote-prompt.ts"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github
                </a>
                .
              </p>

              <h3 className="font-semibold mt-4">How can I contribute?</h3>
              <p className="text-[var(--text-secondary)] mt-1">
                This is a work in progress and we would love help from others.
                Join us on{" "}
                <a
                  className="underline"
                  href="https://discord.gg/VmbBSXKMve"
                  target="_blank"
                  rel="noreferrer"
                >
                  Discord
                </a>
                .
              </p>

              <h3 className="font-semibold mt-4">How can I get in touch?</h3>
              <p className="text-[var(--text-secondary)] mt-1">
                You can reach out to us at{" "}
                <a className="underline" href="mailto:hi@buildcanada.com">
                  hi@buildcanada.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
