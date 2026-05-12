/** Lunes 00:00 local de la semana que contiene `d`. */
export function startOfWeekMonday(d: Date): Date {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = c.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  c.setDate(c.getDate() + diff);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function weekRoadmapKey(iso: string): string {
  const s = startOfWeekMonday(new Date(iso));
  return s.toISOString().slice(0, 10);
}

export function weekRoadmapLabel(iso: string): string {
  const s = startOfWeekMonday(new Date(iso));
  const end = new Date(s);
  end.setDate(end.getDate() + 6);
  const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${s.toLocaleDateString("es-CL", fmt)} – ${end.toLocaleDateString("es-CL", { ...fmt, year: "numeric" })}`;
}
