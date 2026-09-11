type ClassValue = string | false | null | undefined;

/** Join class names, skipping falsy values. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Up to two initials from a name, e.g. "IIIT Bangalore" -> "IB". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + second).toUpperCase();
}
