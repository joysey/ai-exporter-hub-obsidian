import { setIcon } from "obsidian";
import { useEffect, useRef } from "react";
import { platformStyle } from "../utils/platforms";

/** A colored rounded icon badge (used for platforms, metrics, categories). */
export function IconBadge({
  icon,
  color,
  size = 28,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.empty();
      setIcon(ref.current, icon);
    }
  }, [icon]);
  return (
    <span
      className="aikh-badge"
      style={{
        width: size,
        height: size,
        color,
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
      }}
    >
      <span ref={ref} className="aikh-badge-glyph" />
    </span>
  );
}

/** Platform avatar/badge with its brand color. */
export function PlatformBadge({ platform, size = 28 }: { platform: string; size?: number }) {
  const s = platformStyle(platform);
  return <IconBadge icon={s.icon} color={s.color} size={size} />;
}
