import { setIcon } from "obsidian";
import { type CSSProperties, useEffect, useRef } from "react";

/** Renders an Obsidian (lucide) icon by name. */
export function Icon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.empty();
      setIcon(ref.current, name);
    }
  }, [name]);
  return <span ref={ref} className={`aikh-icon ${className ?? ""}`} style={style} />;
}
