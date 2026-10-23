"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher({ onClose }: { onClose?: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = [
    { id: "light", label: "Light", hint: "Bright and clean", icon: Sun },
    { id: "dark", label: "Dark", hint: "Easy on the eyes", icon: Moon },
    { id: "system", label: "System", hint: "Follow device setting", icon: Laptop },
  ];

  return (
    <div className="popover-panel" role="menu" aria-label="Appearance settings">
      <div className="popover-title">Appearance</div>
      {options.map((option) => {
        const Icon = option.icon;
        const selected = mounted && theme === option.id;
        return (
          <button
            className={`popover-row ${selected ? "selected" : ""}`}
            key={option.id}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            onClick={() => { setTheme(option.id); onClose?.(); }}
          >
            <Icon size={16} />
            <span className="row-content"><strong>{option.label}</strong><small>{option.hint}</small></span>
            {selected ? <Check size={15} color="var(--primary)" /> : null}
          </button>
        );
      })}
    </div>
  );
}
