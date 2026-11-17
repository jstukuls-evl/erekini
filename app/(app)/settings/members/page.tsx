import { AppHeader } from "@/components/layout/app-header";
import { MemberList } from "@/components/org/member-list";

export default function MembersPage() {
  return (
    <>
      <AppHeader title="Dalībnieki" />
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-8">
        <p className="text-sm text-[var(--muted)]">
          Lomas: owner, admin, member, viewer (`organization_members`).
        </p>
        <MemberList members={[]} />
      </div>
    </>
  );
}
