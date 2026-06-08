import { DEFAULT_CITY_DATA_RETENTION, LEGAL_ENTITY } from "./legalEntity";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  id: string;
  title: string;
  subtitle: string;
  sections: LegalSection[];
};

export type CityLegalContext = {
  cityName?: string;
  dataRetentionPolicy?: string;
};

const E = LEGAL_ENTITY;

function retentionSection(ctx: CityLegalContext): LegalSection {
  const cityBlock = ctx.cityName
    ? `Commune concernée : ${ctx.cityName}.\n\n${ctx.dataRetentionPolicy?.trim() || DEFAULT_CITY_DATA_RETENTION}`
    : DEFAULT_CITY_DATA_RETENTION;

  return {
    title: "Durées de conservation",
    bullets: [
      "Données de compte agent : jusqu'à suppression du compte ou 3 ans d'inactivité, sauf obligation légale.",
      "Journaux d'audit (actions sur signalements, configuration) : 12 à 36 mois selon le contrat communal.",
      "Logs de sécurité et d'accès au Panel : 12 mois maximum.",
    ],
    paragraphs: [
      `${E.legalName} est responsable de traitement pour les données des comptes staff. Les données citoyennes traitées via le Panel le sont pour le compte de la commune partenaire, dans le cadre du contrat qui la lie à ${E.legalName}.`,
      "Durées spécifiques liées à votre commune (selon le contrat municipal) :",
      cityBlock,
    ],
  };
}

export function buildBackofficeCguDocument(): LegalDocument {
  return {
    id: "cgu",
    title: "Conditions d'utilisation du Panel",
    subtitle: `Version ${E.documentVersion} — ${E.lastUpdated} — ${E.legalName}`,
    sections: [
      {
        title: "1. Objet",
        paragraphs: [
          `Les présentes conditions régissent l'accès au ${E.appName}, ${E.appDescription}`,
          `Le Panel est réservé aux personnels habilités par une commune partenaire ou par ${E.legalName}. Toute utilisation implique l'acceptation des présentes conditions.`,
        ],
      },
      {
        title: "2. Comptes et habilitations",
        bullets: [
          "Chaque compte est personnel et non transférable.",
          "Les droits (maire, assistant, agent) sont attribués par la commune ou l'administrateur plateforme.",
          "Vous devez signaler toute compromission de vos identifiants à support@municipall.dev.",
        ],
      },
      {
        title: "3. Usage autorisé",
        bullets: [
          "Traitement des signalements et messages citoyens dans le cadre du service public.",
          "Configuration de l'application mobile pour votre collectivité.",
          "Communication ciblée auprès des citoyens lorsque le module est activé.",
        ],
        paragraphs: [
          "Toute utilisation à des fins personnelles, commerciales ou contraires à la réglementation est interdite.",
        ],
      },
      {
        title: "4. Données citoyennes",
        paragraphs: [
          "Les agents accèdent aux données citoyennes strictement nécessaires à leur mission. Ces accès peuvent faire l'objet d'un journal d'audit.",
          "La commune reste responsable des décisions administratives prises sur la base des informations affichées dans le Panel.",
        ],
      },
      {
        title: "5. Disponibilité et support",
        paragraphs: [
          `${E.legalName} met en œuvre une obligation de moyens pour assurer la disponibilité du service. Des opérations de maintenance peuvent entraîner des interruptions temporaires.`,
          `Support : ${E.supportEmail}`,
        ],
      },
      {
        title: "6. Droit applicable",
        paragraphs: [
          "Droit français. En cas de litige, recherche amiable préalable puis tribunaux compétents.",
        ],
      },
    ],
  };
}

export function buildStaffPrivacyDocument(
  ctx: CityLegalContext = {},
): LegalDocument {
  return {
    id: "staff-privacy",
    title: "Politique de confidentialité — comptes staff",
    subtitle: `Responsable : ${E.legalName} — DPO : ${E.dpoName}`,
    sections: [
      {
        title: "1. Responsable de traitement",
        paragraphs: [
          `${E.legalName} traite les données des comptes du ${E.appName} en qualité de responsable de traitement.`,
          `DPO : ${E.dpoName} — ${E.dpoEmail}`,
        ],
      },
      {
        title: "2. Données traitées",
        bullets: [
          "Identité : nom, prénom, e-mail professionnel, photo de profil.",
          "Habilitation : rôle, commune rattachée, permissions.",
          "Connexion : horodatages, adresse IP, journaux d'audit des actions sensibles.",
          "Préférences : alertes et notifications du Panel.",
        ],
      },
      {
        title: "3. Finalités",
        bullets: [
          "Authentification et gestion des accès.",
          "Traçabilité des actions sur signalements et configuration (intérêt légitime / obligation de sécurité).",
          "Support technique et amélioration du service.",
        ],
      },
      {
        title: "4. Destinataires",
        paragraphs: [
          "Personnels habilités de Municipall, agents de la commune concernée selon leur rôle, sous-traitants d'hébergement (LWS, France).",
        ],
      },
      retentionSection(ctx),
      {
        title: "Vos droits",
        paragraphs: [
          "Accès, rectification, effacement, limitation, opposition : contactez votre référent communal ou privacy@municipall.dev.",
          `Réclamation CNIL : ${E.cnilComplaintUrl}`,
        ],
      },
    ],
  };
}

export function buildMentionsDocument(): LegalDocument {
  return {
    id: "mentions",
    title: "Mentions légales",
    subtitle: `${E.legalName} — ${E.lastUpdated}`,
    sections: [
      {
        title: "Éditeur",
        bullets: [
          `${E.legalName} (${E.legalForm})`,
          `Siège social : ${E.publisherAddress}`,
          `E-mail : ${E.contactEmail}`,
          `Site : ${E.website}`,
          `SIRET : ${E.siret}`,
          `RCS : ${E.rcs}`,
          `Capital : ${E.capital}`,
        ],
      },
      {
        title: "Directeur de la publication",
        paragraphs: [E.directorOfPublication],
      },
      {
        title: "Délégué à la protection des données",
        paragraphs: [`${E.dpoName} — ${E.dpoEmail}`],
      },
      {
        title: "Hébergement",
        paragraphs: [
          `Hébergeur : ${E.hostingProvider}`,
          E.hostingLocation,
          E.hostingDescription,
        ],
      },
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          `La marque Municip'All, le Panel et l'ensemble des contenus sont protégés. Toute reproduction non autorisée est interdite.`,
        ],
      },
    ],
  };
}

export function buildCookiesDocument(): LegalDocument {
  return {
    id: "cookies",
    title: "Cookies et stockage local",
    subtitle: `${E.appName} — navigateur web`,
    sections: [
      {
        title: "1. Cookies techniques",
        bullets: [
          "Jeton de session (authentification) : nécessaire au fonctionnement du Panel.",
          "Préférences d'affichage (thème clair/sombre) : stockage local.",
        ],
        paragraphs: [
          "Aucun cookie publicitaire ou de traçage tiers n'est déposé par défaut.",
        ],
      },
      {
        title: "2. Durée",
        paragraphs: [
          "Le jeton de session expire selon la politique de sécurité configurée. Déconnectez-vous sur un poste partagé.",
        ],
      },
      {
        title: "3. Contact",
        paragraphs: [E.privacyEmail],
      },
    ],
  };
}

export function buildCitizenPrivacySummary(
  ctx: CityLegalContext = {},
): LegalDocument {
  return {
    id: "citizen-privacy",
    title: "Rappel RGPD — données citoyennes",
    subtitle: `Pour les agents traitant des données via ${E.mobileAppName}`,
    sections: [
      {
        title: "1. Rôle de la commune",
        paragraphs: [
          "Les données des citoyens collectées via l'application mobile sont traitées pour le compte de votre commune, dans le cadre de sa mission de service public.",
          "En tant qu'agent, vous agissez sous l'autorité de votre employeur (la collectivité) et selon les instructions internes de votre mairie.",
        ],
      },
      {
        title: "2. Principes à respecter",
        bullets: [
          "N'accéder qu'aux dossiers nécessaires à votre mission.",
          "Ne pas exporter ni communiquer de données en dehors des circuits autorisés.",
          "Signaler tout incident de sécurité à votre référent et à support@municipall.dev.",
        ],
      },
      retentionSection(ctx),
      {
        title: "3. Exercice des droits des citoyens",
        paragraphs: [
          "Les demandes d'accès, rectification ou effacement des citoyens doivent être traitées par les services compétents de la mairie, avec l'assistance technique de Municipall si nécessaire.",
          `Contact DPO éditeur : ${E.dpoEmail}`,
        ],
      },
    ],
  };
}

export type LegalDocId =
  | "cgu"
  | "staff-privacy"
  | "mentions"
  | "cookies"
  | "citizen-privacy";

export function getLegalDocument(
  id: LegalDocId,
  ctx: CityLegalContext = {},
): LegalDocument {
  switch (id) {
    case "cgu":
      return buildBackofficeCguDocument();
    case "staff-privacy":
      return buildStaffPrivacyDocument(ctx);
    case "mentions":
      return buildMentionsDocument();
    case "cookies":
      return buildCookiesDocument();
    case "citizen-privacy":
      return buildCitizenPrivacySummary(ctx);
    default:
      return buildMentionsDocument();
  }
}

export const LEGAL_HUB_ITEMS: Array<{
  id: LegalDocId;
  label: string;
  description: string;
}> = [
  {
    id: "cgu",
    label: "Conditions d'utilisation du Panel",
    description: "CGU réservées aux comptes staff",
  },
  {
    id: "staff-privacy",
    label: "Confidentialité — comptes staff",
    description: "Données agents, finalités, durées",
  },
  {
    id: "citizen-privacy",
    label: "RGPD — données citoyennes",
    description: "Rappel pour les agents municipaux",
  },
  {
    id: "mentions",
    label: "Mentions légales",
    description: "Éditeur, hébergement, DPO",
  },
  {
    id: "cookies",
    label: "Cookies & stockage local",
    description: "Session et préférences navigateur",
  },
];
