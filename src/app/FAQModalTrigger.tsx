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
        className="mt-3 inline-block text-xs underline text-["
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
                className="ml-3 rounded text-[ hover:text-black/80"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-sm leading-6">
              <h3 className="font-semibold">Why did you build this?</h3>
              <p className="text-[ mt-1">
                We wanted to better understand what is being done in key areas
                that matter to Canadians like us. We built this tracker to know
                what key commitments have been made, what their progress has
                been, and how they impact outcomes.
              </p>

              <h3 className="font-semibold mt-4">
                Where do commitments come from?
              </h3>
              <p className="text-[ mt-1">
                We have pulled commitments from the Liberal Party's platform. We
                show the original text and the source in each commitment's
                details. As new commitments are made, we will add these in.
              </p>

              <h3 className="font-semibold mt-4">
                Where do metrics and targets come from?
              </h3>
              <p className="text-[ mt-1">
                In cases where the Liberal Party has provided a metric and/or
                target, we use that. In other cases, we set a metric based on
                the policy's intention. In each graph, we show where the target
                source comes from.
              </p>

              <h3 className="font-semibold mt-4">
                How are the progress, impact, and alignment scores calculated?
              </h3>
              <p className="text-[ mt-1">
                We use an LLM to score each of these. Our project is open
                sourced on{" "}
                <a
                  className="underline"
                  href="https://github.com/build-canada/outcomes"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github
                </a>
                .
              </p>

              <h3 className="font-semibold mt-4">How can I contribute?</h3>
              <p className="text-[ mt-1">
                This is a work in progress and we would love help from others.
                Join us on{" "}
                <a
                  className="underline"
                  href="https://discord.gg/7rQ3VjYQea"
                  target="_blank"
                  rel="noreferrer"
                >
                  Discord
                </a>
                .
              </p>

              <h3 className="font-semibold mt-4">How can I get in touch?</h3>
              <p className="text-[ mt-1">
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
