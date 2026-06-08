export type HelpArticle = {
  id: string;
  title: string;
  description: string;
  sections: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
  relatedView?: "moderation" | "settings" | "pouls-ai" | "team-insights";
};

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "moderation",
    title: "Guide de modération",
    description: "Traiter les signalements citoyens efficacement.",
    relatedView: "moderation",
    sections: [
      {
        title: "Accéder à la console",
        paragraphs: [
          "Depuis le menu latéral, ouvrez « Modération » pour afficher la matrice des signalements en attente, en cours et clôturés.",
        ],
      },
      {
        title: "Traiter un dossier",
        bullets: [
          "Ouvrez un signalement pour voir la photo, la localisation et l'historique des échanges.",
          "Répondez au citoyen via le fil de messages — chaque réponse est horodatée.",
          "Changez le statut (nouveau, en cours, résolu) pour mettre à jour le suivi.",
        ],
      },
      {
        title: "Bonnes pratiques",
        bullets: [
          "Répondre sous 48 h ouvrées lorsque c'est possible.",
          "Utiliser un ton professionnel et factuel.",
          "Clôturer le dossier une fois le problème traité sur le terrain.",
        ],
      },
    ],
  },
  {
    id: "config",
    title: "Configuration de l'app citoyenne",
    description: "Personnaliser l'application mobile de votre commune.",
    relatedView: "settings",
    sections: [
      {
        title: "Identité visuelle",
        paragraphs: [
          "Dans « Configuration app », modifiez le nom affiché, les couleurs et le logo. Les changements sont visibles par les citoyens après publication.",
        ],
      },
      {
        title: "Modules",
        bullets: [
          "flux-live : fil d'actualité municipale",
          "agenda : événements locaux",
          "reports : signalements citoyens",
          "weather, security, transport : selon contrat",
        ],
      },
      {
        title: "Contact & RGPD",
        paragraphs: [
          "Renseignez l'e-mail et le téléphone du standard municipal. Le texte de conservation des données (RGPD) est affiché aux citoyens dans l'application.",
        ],
      },
    ],
  },
  {
    id: "pulse",
    title: "Municip'All Pulse",
    description: "Comprendre les indicateurs de satisfaction.",
    relatedView: "pouls-ai",
    sections: [
      {
        title: "Vue d'ensemble",
        paragraphs: [
          "Le tableau de bord Pulse agrège les retours citoyens, les délais de traitement et les tendances par catégorie de signalement.",
        ],
      },
      {
        title: "Indicateurs clés",
        bullets: [
          "Taux de résolution : part des signalements clôturés.",
          "Délai moyen de première réponse.",
          "Répartition par quartier ou type d'incident.",
        ],
      },
      {
        title: "Pour les maires",
        paragraphs: [
          "La section « Pilotage équipe » (réservée aux maires) détaille l'activité par agent : dossiers traités, messages envoyés, satisfaction estimée.",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contacter le support",
    description: "Assistance technique Municipall.",
    sections: [
      {
        title: "Canaux",
        bullets: [
          "E-mail : support@municipall.dev (réponse sous 24–48 h ouvrées)",
          "Urgence sécurité : précisez « INCIDENT SÉCURITÉ » en objet",
          "Documentation : municipall.dev",
        ],
      },
      {
        title: "Informations à fournir",
        bullets: [
          "Nom de la commune et votre rôle",
          "Capture d'écran si possible",
          "Heure approximative du problème",
          "Navigateur utilisé (Chrome, Firefox, Safari…)",
        ],
      },
      {
        title: "Disponibilité",
        paragraphs: [
          "Le Panel est hébergé en France. Les maintenances planifiées sont annoncées dans les préférences « Maintenance & système ».",
        ],
      },
    ],
  },
];

export function getHelpArticle(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.id === id);
}
