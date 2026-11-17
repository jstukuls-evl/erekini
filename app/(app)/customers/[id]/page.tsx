import { AppHeader } from "@/components/layout/app-header";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <AppHeader title="Klients" />
      <div className="px-6 py-8 text-sm text-[var(--muted)]">
        Klienta ID: <code>{id}</code> — detalizētais skats Phase 1.
      </div>
    </>
  );
}
