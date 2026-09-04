/**
 * Catalogue des visuels d'engins réellement présents dans `public/engins/`.
 * Aucune URL externe : uniquement des fichiers livrés avec l'application.
 */
export interface FleetImage {
  /** Chemin servi par Vite depuis `public/`. */
  src: string
  /** Texte alternatif — décrit l'engin, pas le fichier. */
  alt: string
  /** Titre affiché sous le visuel. */
  title: string
  /** Type d'engin, aligné sur `Vehicle.type`. */
  type: string
  /** Bénéfice produit associé au visuel. */
  caption: string
}

export const FLEET_IMAGES: FleetImage[] = [
  {
    src: '/engins/pelle-hydraulique-sinomach.jpg',
    alt: 'Pelle hydraulique sur chenilles, bras déployé',
    title: 'Pelle hydraulique',
    type: 'Pelle',
    caption: 'Heures moteur, carburant et position suivis à chaque mission.',
  },
  {
    src: '/engins/camion-benne-cat-797f.jpg',
    alt: 'Camion benne rigide de chantier vu de trois quarts',
    title: 'Camion benne',
    type: 'Camion',
    caption: 'Kilométrage et rotations consolidés par chantier.',
  },
  {
    src: '/engins/chargeuse-pneus-cat.jpg',
    alt: 'Chargeuse sur pneus avec godet chargeur',
    title: 'Chargeuse sur pneus',
    type: 'Chargeuse',
    caption: 'Affectation contrôlée : jamais deux chantiers en même temps.',
  },
  {
    src: '/engins/niveleuse-john-deere.jpg',
    alt: 'Niveleuse articulée avec lame centrale',
    title: 'Niveleuse',
    type: 'Niveleuse',
    caption: 'Contrôles départ/retour horodatés et signés.',
  },
  {
    src: '/engins/tractopelle-komatsu.jpg',
    alt: 'Tractopelle équipée d’un godet avant et d’un bras arrière',
    title: 'Tractopelle',
    type: 'Tractopelle',
    caption: 'Incidents remontés depuis le terrain, photos à l’appui.',
  },
  {
    src: '/engins/compacteur-bomag.jpg',
    alt: 'Compacteur monocylindre vibrant',
    title: 'Compacteur',
    type: 'Compacteur',
    caption: 'Maintenance déclenchée sur seuils réels d’utilisation.',
  },
  {
    src: '/engins/chargeuse-chenilles-cat-973k.jpg',
    alt: 'Chargeuse sur chenilles avec godet relevé',
    title: 'Chargeuse sur chenilles',
    type: 'Chargeuse',
    caption: 'Disponibilité de la flotte visible en un coup d’œil.',
  },
  {
    src: '/engins/chariot-elevateur-jac.jpg',
    alt: 'Chariot élévateur thermique avec mât de levage',
    title: 'Chariot élévateur',
    type: 'Chariot',
    caption: 'Logistique de site intégrée au même suivi.',
  },
]

/** Visuel par défaut associé à un type d'engin (fiches, listes). */
export function imageForVehicleType(type?: string): string | undefined {
  if (!type) return undefined
  const match = FLEET_IMAGES.find(
    (i) => i.type.toLowerCase() === type.toLowerCase(),
  )
  return match?.src
}
