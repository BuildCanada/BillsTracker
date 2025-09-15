export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--panel-border)] bg-white">
      <div className="mx-auto max-w-[1120px] px-6 py-12">
        <div className="flex justify-between md:flex-row flex-col gap-4">
          {/* Brand Section */}
          <div className="space-y-4  md:mb-auto mb-4">
            <div className="flex items-start gap-3">
              <img
                src="https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg"
                alt="Build Canada"
                className="bg-[#932f2f] h-10 w-auto p-2 rounded"
              />
              <div className="flex flex-col items-start -mt-1 ">

                <span className="font-semibold text-lg mb-0">Policy Tracker</span>
                <div className="text-xs">

                  Powered by {' '}
                  <a href="https://civicsproject.org" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted-foreground)] underline">
                    The Civics Project
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Navigation Links */}


          {/* Contact & Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base mb-1 md:mb-2" >Connect</h3>
            <div className="space-y-">
              <p className="text-sm text-[var(--muted-foreground)]">
                Questions or feedback?
              </p>
              <a href="mailto:hello@buildcanada.ca"
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                hello@buildcanada.ca
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-[var(--panel-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} Build Canada Bills. All rights reserved.
            A Project of {' '}
            <a href="https://buildcanada.ca" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted-foreground)] underline">
              Build Canada
            </a>

          </p>

        </div>
      </div>
    </footer>
  );
}