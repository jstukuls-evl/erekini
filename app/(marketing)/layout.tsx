import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--line)] px-6 py-8 text-sm text-[var(--muted)] md:px-10">
        <p>© 2026 erekini · Latvijas e-rēķinu darba rīks</p>
      </footer>
    </div>
  );
}
