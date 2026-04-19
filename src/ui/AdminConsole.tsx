import React, { useEffect, useMemo, useState } from "react";
import { T, type Locale } from "../i18n";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  is_admin: number;
  is_premium: number;
  created_at: string;
  last_login: string | null;
  poem_count: number;
}

interface AdminPoem {
  id: number;
  text: string;
  saved_at: string;
}

interface AdminConsoleProps {
  locale: Locale;
  onBack: () => void;
}

type SortKey = "created_at" | "last_login" | "poem_count";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 200;

function formatDate(iso: string | null, neverLabel: string): string {
  if (!iso) return neverLabel;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return neverLabel;
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function firstLine(text: string): string {
  const line = text.split(/\r?\n/).find(l => l.trim().length > 0) ?? "";
  return line.trim();
}

function SortHeader({
  label, sortKey, activeKey, activeDir, align = "left", onClick,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  activeDir: SortDir;
  align?: "left" | "right";
  onClick: () => void;
}) {
  const isActive = activeKey === sortKey;
  const arrow = isActive ? (activeDir === "desc" ? "↓" : "↑") : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 hover:text-gold transition-colors ${
        align === "right" ? "ml-auto flex-row-reverse" : ""
      }`}
    >
      <span>{label}</span>
      {isActive && <span className="text-gold text-xs">{arrow}</span>}
    </button>
  );
}

export default function AdminConsole({ locale, onBack }: AdminConsoleProps) {
  const t = T[locale];
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userPoems, setUserPoems] = useState<AdminPoem[] | null>(null);
  const [poemsLoading, setPoemsLoading] = useState(false);
  const [expandedPoemId, setExpandedPoemId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  function toggleSort(key: SortKey) {
    setPage(0);
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortDir("asc");
    } else {
      setSortKey(null);
      setSortDir("desc");
    }
  }

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(data => setUsers(data.users))
      .catch(() => setError(t.adminLoadError));
  }, [t]);

  useEffect(() => {
    if (!selectedUser) {
      setUserPoems(null);
      setExpandedPoemId(null);
      return;
    }
    setPoemsLoading(true);
    fetch(`/api/admin/users/${encodeURIComponent(selectedUser.id)}/poems`, {
      credentials: "include",
    })
      .then(r => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(data => setUserPoems(data.poems))
      .catch(() => setError(t.adminLoadError))
      .finally(() => setPoemsLoading(false));
  }, [selectedUser, t]);

  const sortedUsers = useMemo(() => {
    if (!users) return null;
    if (!sortKey) return users;
    const copy = [...users];
    copy.sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp: number;
      if (sortKey === "poem_count") {
        cmp = (av as number) - (bv as number);
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return copy;
  }, [users, sortKey, sortDir]);

  const totalPages = sortedUsers ? Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE)) : 1;
  const safePage = Math.min(page, totalPages - 1);
  const pagedUsers = useMemo(() => {
    if (!sortedUsers) return null;
    const start = safePage * PAGE_SIZE;
    return sortedUsers.slice(start, start + PAGE_SIZE);
  }, [sortedUsers, safePage]);

  if (selectedUser) {
    const header = t.adminUserPoemsHeader(selectedUser.name || selectedUser.email);

    return (
      <div className="min-h-screen bg-ink-bg text-cream font-serif flex flex-col">
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedUser(null)}
            className="text-creamDim hover:text-gold text-sm font-sans mb-4"
          >
            {t.adminBackToUsers}
          </button>
          <h2 className="text-xl text-gold mb-4">{header}</h2>

          {poemsLoading && <div className="text-creamDim">...</div>}
          {userPoems && userPoems.length === 0 && (
            <div className="text-creamDim">{t.adminNoPoems}</div>
          )}
          {userPoems && userPoems.length > 0 && (
            <ul className="space-y-3">
              {userPoems.map(p => {
                const expanded = expandedPoemId === p.id;
                return (
                  <li
                    key={p.id}
                    className="border border-ink-line rounded p-3 cursor-pointer hover:border-gold/50"
                    onClick={() => setExpandedPoemId(expanded ? null : p.id)}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-cream font-serif text-lg">
                        {expanded ? p.text.split(/\r?\n/).map((line, i) => (
                          <div key={i}>{line || "\u00A0"}</div>
                        )) : firstLine(p.text)}
                      </div>
                      <div className="text-creamDim text-xs font-sans whitespace-nowrap">
                        {new Date(p.saved_at).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-bg text-cream font-serif flex flex-col">
      <div className="max-w-5xl w-full mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="text-creamDim hover:text-gold text-sm font-sans mb-4"
        >
          ← {t.adminBack}
        </button>
        <h1 className="text-2xl text-gold mb-6">{t.adminTitle}</h1>
        <h2 className="text-lg text-cream mb-4">{t.adminUsersHeader}</h2>

        {error && <div className="text-rose text-sm mb-4">{error}</div>}
        {!users && !error && <div className="text-creamDim">...</div>}

        {users && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-ink-line text-creamDim">
                  <th className="text-left py-2 pr-3">{t.adminColName}</th>
                  <th className="text-left py-2 pr-3">{t.adminColEmail}</th>
                  <th className="text-left py-2 pr-3">
                    <SortHeader label={t.adminColSignup} sortKey="created_at"
                      activeKey={sortKey} activeDir={sortDir}
                      onClick={() => toggleSort("created_at")} />
                  </th>
                  <th className="text-left py-2 pr-3">
                    <SortHeader label={t.adminColLastLogin} sortKey="last_login"
                      activeKey={sortKey} activeDir={sortDir}
                      onClick={() => toggleSort("last_login")} />
                  </th>
                  <th className="text-right py-2">
                    <SortHeader label={t.adminColPoems} sortKey="poem_count"
                      activeKey={sortKey} activeDir={sortDir}
                      align="right"
                      onClick={() => toggleSort("poem_count")} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers!.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-ink-line/50 hover:bg-ink-line/20 cursor-pointer"
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="py-2 pr-3 text-cream">
                      {u.name}
                      {u.is_admin === 1 && (
                        <span className="ml-2 text-xs text-gold">admin</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-creamDim">{u.email}</td>
                    <td className="py-2 pr-3 text-creamDim">
                      {formatDate(u.created_at, t.adminNever)}
                    </td>
                    <td className="py-2 pr-3 text-creamDim">
                      {formatDate(u.last_login, t.adminNever)}
                    </td>
                    <td className="py-2 text-right text-cream tabular-nums">
                      {u.poem_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedUsers && sortedUsers.length > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 mt-4 font-sans text-sm">
                <div className="text-creamDim">
                  {t.adminPageReadout(safePage + 1, totalPages, sortedUsers.length)}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="px-3 py-1 border border-ink-line rounded text-cream hover:text-gold hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.adminPagePrev}
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    className="px-3 py-1 border border-ink-line rounded text-cream hover:text-gold hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.adminPageNext}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
