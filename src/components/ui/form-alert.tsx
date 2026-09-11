/** Form-level error, announced when it appears. */
export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-control border border-warn/30 bg-warn/10 px-3 py-2.5 text-sm text-warn-strong">
      {children}
    </p>
  );
}
