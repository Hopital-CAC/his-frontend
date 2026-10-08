/**
 * Détermine la route d'accueil d'un utilisateur authentifié.
 *
 * Ordre de décision :
 * 1. Profils institutionnels de supervision.
 * 2. Rôle métier principal, confirmé par sa permission.
 * 3. Première permission métier disponible pour les rôles personnalisés.
 * 4. Refus par défaut.
 *
 * Le frontend améliore l'expérience utilisateur. Le backend et les gardes
 * de routes restent les autorités de contrôle d'accès.
 */

const SUPERVISION_ROLES = new Set([
  "admin",
  "direction",
  "directeur",
]);

const ROLE_DEFAULT_ROUTES = {
  secretaire: {
    permission: "reception:read",
    path: "/receptions/dashboard",
  },
  infirmier: {
    permission: "triage:read",
    path: "/triage/dashboard",
  },
  medecin: {
    permission: "consultation:read",
    path: "/consultations/dashboard",
  },
  laborantin: {
    permission: "examen:read",
    path: "/laboratoire/dashboard",
  },
  lab_technician: {
    permission: "examen:read",
    path: "/laboratoire/dashboard",
  },
  lab_biologist: {
    permission: "examen:read",
    path: "/laboratoire/dashboard",
  },
  radiologue: {
    permission: "examen:read",
    path: "/imagerie",
  },
  imagerie: {
    permission: "examen:read",
    path: "/imagerie",
  },
  radiology_technician: {
    permission: "examen:read",
    path: "/imagerie",
  },
  radiologist: {
    permission: "examen:read",
    path: "/imagerie",
  },
  pharmacien: {
    permission: "pharmacie:read",
    path: "/pharmacie/dashboard",
  },
  caissier: {
    permission: "paiement:read",
    path: "/paiements/dashboard",
  },
  auditeur: {
    permission: "audit:read",
    path: "/audit",
  },
};

const PERMISSION_FALLBACKS = [
  { permission: "reception:read", path: "/receptions/dashboard" },
  { permission: "triage:read", path: "/triage/dashboard" },
  { permission: "consultation:read", path: "/consultations/dashboard" },
  { permission: "examen:read", path: "/laboratoire/dashboard" },
  { permission: "examen:read", path: "/imagerie" },
  { permission: "pharmacie:read", path: "/pharmacie/dashboard" },
  { permission: "paiement:read", path: "/paiements/dashboard" },
  { permission: "hospitalisation:read", path: "/hospitalisation/dashboard" },
  { permission: "sortie:read", path: "/sorties/dashboard" },
  { permission: "audit:read", path: "/audit" },
];

function normalizeRole(auth) {
  return String(
    auth?.role ??
      auth?.roleCode ??
      auth?.user?.role?.code ??
      auth?.user?.roleCode ??
      "",
  )
    .trim()
    .toLowerCase();
}

function canAccess(auth, permission) {
  if (!permission) {
    return true;
  }

  return (
    typeof auth?.hasPermission === "function" &&
    auth.hasPermission(permission)
  );
}

export function getDefaultRoute(auth) {
  const role = normalizeRole(auth);

  if (SUPERVISION_ROLES.has(role)) {
    return "/dashboard";
  }

  const roleDefault = ROLE_DEFAULT_ROUTES[role];

  if (roleDefault && canAccess(auth, roleDefault.permission)) {
    return roleDefault.path;
  }

  const permissionFallback = PERMISSION_FALLBACKS.find((rule) =>
    canAccess(auth, rule.permission),
  );

  if (permissionFallback) {
    return permissionFallback.path;
  }

  return "/acces-refuse";
}
