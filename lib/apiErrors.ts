/** Messages API connus (anglais) → français pour l'interface backoffice. */
const EXACT_TRANSLATIONS: Record<string, string> = {
  "Invalid credentials":
    "Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe.",
  "User not found": "Compte introuvable.",
  Unauthorized: "Non autorisé. Veuillez vous reconnecter.",
  Forbidden: "Accès refusé.",
  "Email is required": "L'adresse e-mail est obligatoire.",
  "Invitation not found": "Invitation introuvable.",
  "Avatar URL is required": "L'URL de l'avatar est obligatoire.",
  "Report not found": "Signalement introuvable.",
  "Authentication required": "Session expirée. Reconnectez-vous.",
  "Accès non autorisé à ce signalement":
    "Vous ne pouvez pas répondre à ce signalement.",
  "Ce signalement est clôturé.":
    "Ce signalement est clôturé, vous ne pouvez plus envoyer de message.",
  "Construction work not found": "Chantier introuvable.",
  "No partner city found at this location":
    "Aucune ville partenaire à cet emplacement.",
};

function normalizeKey(message: string): string {
  return message.trim();
}

function looksFrench(message: string): boolean {
  return /[àâäéèêëïîôùûüçœæ]/i.test(message);
}

function translateByStatus(status: number): string {
  switch (status) {
    case 400:
      return "Requête invalide. Vérifiez les informations saisies.";
    case 401:
      return "Identifiants incorrects ou session expirée.";
    case 403:
      return "Vous n'avez pas les droits pour effectuer cette action.";
    case 404:
      return "Élément introuvable.";
    case 409:
      return "Cette action entre en conflit avec des données existantes.";
    case 422:
      return "Données invalides. Vérifiez le formulaire.";
    case 429:
      return "Trop de requêtes. Réessayez dans quelques instants.";
    case 500:
    case 502:
    case 503:
      return "Erreur serveur. Réessayez plus tard.";
    default:
      return "Une erreur est survenue.";
  }
}

function translateSingleMessage(message: string, status: number): string {
  const key = normalizeKey(message);
  if (!key) return translateByStatus(status);

  const exact = EXACT_TRANSLATIONS[key];
  if (exact) return exact;

  const lower = key.toLowerCase();
  for (const [en, fr] of Object.entries(EXACT_TRANSLATIONS)) {
    if (en.toLowerCase() === lower) return fr;
  }

  if (lower.includes("invalid credentials")) {
    return EXACT_TRANSLATIONS["Invalid credentials"];
  }
  if (lower.includes("not found")) {
    return "Élément introuvable.";
  }
  if (lower.includes("unauthorized")) {
    return translateByStatus(401);
  }
  if (lower.includes("forbidden")) {
    return translateByStatus(403);
  }

  if (looksFrench(key)) return key;

  return translateByStatus(status);
}

export function extractApiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const raw = (data as { message?: unknown }).message;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const parts = raw.filter((m): m is string => typeof m === "string");
    if (parts.length) return parts.join(" ");
  }
  return undefined;
}

/** Traduit un message d'erreur API pour l'affichage utilisateur. */
export function translateApiError(
  data: unknown,
  status: number,
  fallback = "Une erreur est survenue",
): string {
  const raw = extractApiErrorMessage(data);
  if (!raw) return translateByStatus(status) || fallback;
  return translateSingleMessage(raw, status);
}
