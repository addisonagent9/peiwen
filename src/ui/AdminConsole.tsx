import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { T, type Locale } from "../i18n";

const AudioReview = lazy(() => import("../components/admin/AudioReview"));

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
  const [adminTab, setAdminTab] = useState<"users" | "audio">("users");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.id) setCurrentUserId(String(data.id)); })
      .catch(() => {});
  }, []);

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

  async function togglePremium(user: AdminUser) {
    const newVal = user.is_premium === 1 ? 0 : 1;
    const action = newVal === 1 ? '设为 Premium' : '撤销 Premium';
    if (!confirm(`确定要将 ${user.name || user.email} ${action}?`)) return;

    setToggleLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_premium: newVal }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || `HTTP ${res.status}`);
        return;
      }
      const { user: updated } = await res.json();
      setUsers(prev => prev ? prev.map(u => u.id === updated.id ? updated : u) : prev);
    } catch (err) {
      alert(`操作失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setToggleLoading(null);
    }
  }

  async function toggleAdmin(user: AdminUser) {
    const newVal = user.is_admin === 1 ? 0 : 1;
    const action = newVal === 1 ? '设为管理员' : '撤销管理员';
    if (!confirm(`确定要将 ${user.name || user.email} ${action}?`)) return;

    setToggleLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_admin: newVal }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.error === 'CANNOT_DEMOTE_SELF' ? '无法撤销自己的管理员权限'
          : body.error === 'LAST_ADMIN' ? '无法撤销最后一位管理员'
          : body.error || `HTTP ${res.status}`;
        alert(msg);
        return;
      }
      const { user: updated } = await res.json();
      setUsers(prev => prev ? prev.map(u => u.id === updated.id ? updated : u) : prev);
    } catch (err) {
      alert(`操作失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setToggleLoading(null);
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
        <h1 className="text-2xl text-gold mb-4">{t.adminTitle}</h1>

        <div className="flex gap-4 mb-6 border-b border-ink-line">
          <button
            onClick={() => setAdminTab("users")}
            className={`pb-2 text-sm font-sans transition ${
              adminTab === "users"
                ? "text-gold border-b-2 border-gold"
                : "text-creamDim hover:text-gold"
            }`}
          >{t.adminUsersHeader}</button>
          <button
            onClick={() => setAdminTab("audio")}
            className={`pb-2 text-sm font-sans transition ${
              adminTab === "audio"
                ? "text-gold border-b-2 border-gold"
                : "text-creamDim hover:text-gold"
            }`}
          >音频审核</button>
        </div>

        {adminTab === "audio" && (
          <Suspense fallback={<div className="text-creamDim">...</div>}>
            <AudioReview />
          </Suspense>
        )}

        {adminTab === "users" && (<>
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
                  <th className="text-right py-2 pr-3">
                    <SortHeader label={t.adminColPoems} sortKey="poem_count"
                      activeKey={sortKey} activeDir={sortDir}
                      align="right"
                      onClick={() => toggleSort("poem_count")} />
                  </th>
                  <th className="text-right py-2">权限</th>
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
                    </td>
                    <td className="py-2 pr-3 text-creamDim">{u.email}</td>
                    <td className="py-2 pr-3 text-creamDim">
                      {formatDate(u.created_at, t.adminNever)}
                    </td>
                    <td className="py-2 pr-3 text-creamDim">
                      {formatDate(u.last_login, t.adminNever)}
                    </td>
                    <td className="py-2 pr-3 text-right text-cream tabular-nums">
                      {u.poem_count}
                    </td>
                    <td className="py-2 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Admin toggle */}
                        {String(u.id) === currentUserId ? (
                          <span className="text-xs text-gold px-2 py-0.5 rounded border border-gold/30 bg-gold/10">管理员</span>
                        ) : (
                          <button
                            onClick={() => toggleAdmin(u)}
                            disabled={toggleLoading === u.id}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors disabled:opacity-50 ${
                              u.is_admin === 1
                                ? 'text-gold border-gold/30 bg-gold/10 hover:bg-gold/20'
                                : 'text-creamDim border-ink-line hover:text-cream hover:border-cream/40'
                            }`}
                          >
                            {toggleLoading === u.id ? '...' : u.is_admin === 1 ? '管理员 ✕' : '设为管理员'}
                          </button>
                        )}
                        {/* Premium toggle — static badge for admins (admin implies premium) */}
                        {u.is_admin === 1 ? (
                          <span className="text-xs text-teal px-2 py-0.5 rounded border border-teal/30 bg-teal/10" title="管理员自动享有 Premium 权限">Premium</span>
                        ) : String(u.id) === currentUserId ? (
                          u.is_premium === 1 ? (
                            <span className="text-xs text-teal px-2 py-0.5 rounded border border-teal/30 bg-teal/10">Premium</span>
                          ) : null
                        ) : (
                          <button
                            onClick={() => togglePremium(u)}
                            disabled={toggleLoading === u.id}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors disabled:opacity-50 ${
                              u.is_premium === 1
                                ? 'text-teal border-teal/30 bg-teal/10 hover:bg-teal/20'
                                : 'text-creamDim border-ink-line hover:text-cream hover:border-cream/40'
                            }`}
                          >
                            {toggleLoading === u.id ? '...' : u.is_premium === 1 ? 'Premium ✕' : '设为 Premium'}
                          </button>
                        )}
                      </div>
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
        </>)}
      </div>
    </div>
  );
}
