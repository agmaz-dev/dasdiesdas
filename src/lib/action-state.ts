export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Zuletzt eingegebene Werte, damit Formulare nach Fehlern befüllt bleiben */
  values?: Record<string, string | string[]>;
};

export const initialState: ActionState = {};

/** FormData → einfaches Objekt (ohne Passwörter) für die erneute Befüllung */
export function formValues(fd: FormData, omit: string[] = ["password", "password2", "currentPassword"]): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(fd.keys())) {
    if (omit.includes(key) || key.startsWith("$ACTION")) continue;
    const all = fd.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return out;
}
