const footerLinks = {
  Product: [
    { label: "Platform", href: "#platform" },
    { label: "AI Gateway", href: "#ai" },
    { label: "Agents", href: "#" },
    { label: "Analytics", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Status", href: "#" },
    { label: "Security", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Compliance", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
                C
              </span>
              <span className="text-lg font-semibold tracking-tight text-zinc-50">
                CBAI{" "}
                <span className="font-normal text-zinc-400">Enterprise</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Secure, scalable AI infrastructure for organizations that demand
              performance, compliance, and control.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-zinc-300">
                {category}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} CBAI Enterprise. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
