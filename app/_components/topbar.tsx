"use client";
import { useEffect, useRef, useState } from "react";
import { CURRENT_USER } from "@/lib/data";
import { Avatar } from "./avatar";
import { CommandPalette } from "./command-palette";
import { IconBell, IconCommand, IconLogout, IconSearch } from "./icons";
import { Menu } from "./menu";

export function TopBar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [notificationsOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-surface/90 px-6 backdrop-blur">
        <div className="flex-1" />
        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="group inline-flex h-9 min-w-[260px] items-center gap-2.5 rounded-md border border-border bg-surface-2 px-3 text-[13px] text-muted transition-colors hover:bg-surface-3"
          >
            <IconSearch size={14} />
            <span className="flex-1 text-left">Search cases, documents, people…</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <IconCommand size={11} />
              <span>K</span>
            </span>
          </button>
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((s) => !s)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <IconBell size={15} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full z-40 mt-1.5 w-80 overflow-hidden rounded-lg border border-border bg-surface shadow-2 anim-pop">
                <div className="border-b border-border px-4 py-2.5 text-[13px] font-medium text-ink">
                  Notifications
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  <p className="px-2 py-6 text-center text-[13px] text-muted">No new notifications</p>
                </div>
              </div>
            )}
          </div>
          <Menu
            trigger={<Avatar person={CURRENT_USER} size={28} />}
            items={[
              { id: "profile", label: "Profile" },
              { id: "settings", label: "Settings" },
              { id: "logout", label: "Sign out", icon: <IconLogout size={13} />, destructive: true },
            ]}
          />
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}


