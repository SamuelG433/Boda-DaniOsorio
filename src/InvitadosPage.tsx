import { useState, useEffect, useMemo } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// ── Cambia esta clave cuando quieras ─────────────────────────────────────────
const ACCESS_PASSWORD = "boda2024";
// ─────────────────────────────────────────────────────────────────────────────

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cb9f5f97`;

interface Rsvp {
  name: string;
  attending: string;
  diet: string | null;
  timestamp: string;
}

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

// ── Password gate ─────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === ACCESS_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div className="min-h-screen bg-khaki-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-8">
        <div>
          <h1 className="font-cursive text-5xl text-khaki-800 mb-2">F & D</h1>
          <p className="text-xs uppercase tracking-[0.2em] text-khaki-500">
            Lista de invitados
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-khaki-200 shadow-sm p-8 space-y-4"
        >
          <label htmlFor="access-password" className="text-sm text-khaki-700">
            Ingresa la clave para ver la lista
          </label>
          <input
            id="access-password"
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            className="w-full bg-khaki-50 border border-khaki-200 px-4 py-3 text-khaki-900 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-khaki-500/40 focus:border-khaki-500 transition-colors"
            placeholder="••••••••"
            autoComplete="current-password"
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-500">Clave incorrecta. Intenta de nuevo.</p>
          )}
          <button
            type="submit"
            className="w-full bg-khaki-800 text-white uppercase tracking-widest py-3 text-sm hover:bg-khaki-900 transition-colors min-h-[44px]"
          >
            Acceder
          </button>
        </form>

        <a
          href="/"
          className="inline-flex items-center min-h-[44px] text-xs text-khaki-400 hover:text-khaki-600 transition-colors uppercase tracking-wider"
        >
          ← Volver a la invitación
        </a>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function GuestList() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [search, setSearch] = useState("");

  const load = () => {
    setStatus("loading");
    fetch(`${SERVER_BASE}/rsvps`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Error de red");
        return r.json();
      })
      .then((data) => {
        const confirmed: Rsvp[] = (data.rsvps ?? [])
          .filter((r: Rsvp) => r.attending === "yes")
          .sort(
            (a: Rsvp, b: Rsvp) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          );
        setRsvps(confirmed);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rsvps;
    return rsvps.filter((r) => r.name.toLowerCase().includes(q));
  }, [rsvps, search]);

  const downloadCsv = () => {
    const header = ["Nombre", "Restricciones alimenticias", "Fecha de respuesta"];
    const rows = filtered.map((r) => [
      r.name,
      r.diet ?? "",
      r.timestamp ? new Date(r.timestamp).toLocaleString("es-MX") : "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confirmados_boda_FyD.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-khaki-50">
      {/* Header */}
      <header className="bg-white border-b border-khaki-100 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="font-cursive text-3xl md:text-4xl text-khaki-800 leading-none">
              Felipe & Daniela
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-khaki-500 mt-1">
              Lista de confirmados
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center min-h-[44px] px-2 -mr-2 text-xs text-khaki-400 hover:text-khaki-600 transition-colors uppercase tracking-wider shrink-0"
          >
            ← Invitación
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Counter */}
        {status === "ok" && (
          <div className="text-center py-8 border-y border-khaki-200">
            <p className="font-cursive text-7xl md:text-8xl text-khaki-700 leading-none">
              {rsvps.length}
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-khaki-500 mt-2">
              {rsvps.length === 1 ? "confirmado" : "confirmados"}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-khaki-400 pointer-events-none" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="search"
              aria-label="Buscar invitado por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full bg-white border border-khaki-200 pl-10 pr-4 py-3 text-khaki-900 placeholder:text-khaki-300 focus:outline-none focus:ring-2 focus:ring-khaki-500/40 focus:border-khaki-500 transition-colors text-sm min-h-[44px]"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-2 px-4 py-3 border border-khaki-200 bg-white text-khaki-600 text-sm hover:bg-khaki-50 transition-colors min-h-[44px]"
              aria-label="Actualizar lista de invitados"
            >
              <RefreshIcon />
              <span className="hidden sm:inline uppercase tracking-wider text-xs">
                Actualizar
              </span>
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-3 bg-khaki-800 text-white text-sm hover:bg-khaki-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider min-h-[44px]"
            >
              <DownloadIcon />
              <span className="hidden sm:inline text-xs">Descargar Excel</span>
            </button>
          </div>
        </div>

        {/* Table / States */}
        {status === "loading" && (
          <div className="py-24 text-center">
            <p className="text-khaki-400 text-xs uppercase tracking-widest animate-pulse">
              Cargando confirmaciones…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="py-16 text-center border border-red-100 bg-red-50">
            <p className="text-red-600 text-sm mb-4">
              No pudimos cargar la lista. Revisa tu conexión e intenta de nuevo.
            </p>
            <button
              onClick={load}
              className="text-xs uppercase tracking-wider text-red-500 border border-red-200 px-4 py-2 hover:bg-red-100 transition-colors"
            >
              Volver a intentar
            </button>
          </div>
        )}

        {status === "ok" && rsvps.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-cursive text-4xl text-khaki-300 mb-3">Sin confirmaciones</p>
            <p className="text-khaki-400 text-xs uppercase tracking-widest">
              Aún no hay respuestas registradas
            </p>
          </div>
        )}

        {status === "ok" && rsvps.length > 0 && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-khaki-400 text-sm">
              Ningún invitado coincide con{" "}
              <span className="text-khaki-600">"{search}"</span>
            </p>
          </div>
        )}

        {status === "ok" && filtered.length > 0 && (
          <div className="bg-white border border-khaki-200 shadow-sm overflow-x-auto">
            {search && (
              <div className="px-4 py-2 border-b border-khaki-100 bg-khaki-50">
                <p className="text-xs text-khaki-500">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "persona encontrada" : "personas encontradas"} para "{search}"
                </p>
              </div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-khaki-100">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-khaki-400 font-medium">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-khaki-400 font-medium hidden sm:table-cell">
                    Restricciones alimenticias
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-khaki-400 font-medium hidden md:table-cell">
                    Fecha de respuesta
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-khaki-50 last:border-0 hover:bg-khaki-50/60 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-khaki-900 font-medium">
                      {r.name}
                      {/* mobile: show diet below name */}
                      {r.diet && (
                        <p className="sm:hidden text-xs text-khaki-500 font-normal mt-0.5">
                          {r.diet}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-khaki-500 hidden sm:table-cell">
                      {r.diet || <span className="text-khaki-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-khaki-400 text-xs whitespace-nowrap hidden md:table-cell">
                      {r.timestamp
                        ? new Date(r.timestamp).toLocaleString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function InvitadosPage() {
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem("invitados_auth") === "1";
  });

  const handleUnlock = () => {
    sessionStorage.setItem("invitados_auth", "1");
    setUnlocked(true);
  };

  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;
  return <GuestList />;
}
