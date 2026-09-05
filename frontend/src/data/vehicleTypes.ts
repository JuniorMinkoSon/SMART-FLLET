/**
 * Types d'engins gérés par la flotte.
 *
 * Liste unique, partagée par la fiche véhicule et les habilitations des
 * opérateurs : c'est ce qui permet de vérifier qu'un conducteur peut prendre un
 * engin donné. Deux listes divergentes rendraient la comparaison impossible.
 */
export const VEHICLE_TYPES = [
  'Pelle',
  'Bulldozer',
  'Niveleuse',
  'Camion',
  'Grue',
  'Compacteur',
  'Chargeuse',
  'Tractopelle',
] as const

export type VehicleType = (typeof VEHICLE_TYPES)[number]
