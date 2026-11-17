type Member = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
};

type Props = {
  members: Member[];
};

export function MemberList({ members }: Props) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Dalībnieku saraksts būs pieejams pēc Supabase pieslēgšanas.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-md bg-white">
      {members.map((m) => (
        <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <div>
            <p className="font-medium text-[var(--ink)]">
              {m.full_name ?? m.email ?? "Lietotājs"}
            </p>
            {m.email ? (
              <p className="text-[var(--muted)]">{m.email}</p>
            ) : null}
          </div>
          <span className="text-[var(--ink-soft)]">{m.role}</span>
        </li>
      ))}
    </ul>
  );
}
