import { describe, it, expect } from 'vitest'
import { toVehicle, toDriver, toMission, toAlert, toFuelEntry } from '@/services/adapters'

/**
 * Traduction des réponses du serveur vers les types de l'interface.
 *
 * C'est désormais la seule logique métier restée côté navigateur : les
 * transitions de mission et le contrôle des chevauchements sont appliqués par le
 * serveur, qui les teste lui-même. Ce qui se casse ici est un écart de contrat —
 * un statut renommé, un champ déplacé — et se manifeste par une carte vide sans
 * la moindre erreur.
 */

describe('Véhicule', () => {
  const base = {
    id: 'v1',
    code: 'ENG-001',
    type: 'Pelle',
    plate: 'CI-4521-AB',
    status: 'EN_MISSION',
    km: 52340,
    engineHours: 1243,
    fuelLevel: 66,
    condition: 'Bon',
  }

  it('traduit les statuts en capitales vers la casse de l’interface', () => {
    expect(toVehicle({ ...base, status: 'EN_MISSION' }).status).toBe('en_mission')
    expect(toVehicle({ ...base, status: 'HORS_SERVICE' }).status).toBe('hors_service')
    expect(toVehicle({ ...base, status: 'DISPONIBLE' }).status).toBe('disponible')
  })

  it('garde un véhicule visible même si son statut est inconnu', () => {
    // Une valeur inattendue ne doit pas faire disparaître un engin de la flotte.
    expect(toVehicle({ ...base, status: 'ETAT_INCONNU' }).status).toBe('disponible')
  })

  it('reprend le code d’inventaire quand le nom d’usage manque', () => {
    expect(toVehicle({ ...base, name: null }).name).toBe('ENG-001')
    expect(toVehicle({ ...base, name: '   ' }).name).toBe('ENG-001')
    expect(toVehicle({ ...base, name: 'Pelle Komatsu 210' }).name).toBe('Pelle Komatsu 210')
  })

  it('conserve les compteurs tels quels', () => {
    const v = toVehicle(base)
    expect(v.km).toBe(52340)
    expect(v.engineHours).toBe(1243)
    expect(v.fuelLevel).toBe(66)
  })

  it('présente un état absent comme bon', () => {
    expect(toVehicle({ ...base, condition: null }).condition).toBe('Bon')
    expect(toVehicle({ ...base, condition: 'Mauvais' }).condition).toBe('Mauvais')
    expect(toVehicle({ ...base, condition: 'Moyen' }).condition).toBe('Moyen')
  })

  it('laisse site et conducteur affecté vides plutôt que nuls', () => {
    const v = toVehicle({ ...base, site: null, driverId: null })
    expect(v.site).toBeUndefined()
    expect(v.driverId).toBeUndefined()
  })
})

describe('Conducteur', () => {
  const base = {
    id: 'd1',
    name: 'Moussa Koné',
    status: 'DISPONIBLE',
  }

  it('traduit le statut', () => {
    expect(toDriver({ ...base, status: 'EN_MISSION' }).status).toBe('en_mission')
    expect(toDriver({ ...base, status: 'INDISPONIBLE' }).status).toBe('indisponible')
  })

  it('laisse le matricule vide quand il n’est pas saisi', () => {
    // Un matricule manquant est un défaut à signaler, pas une valeur à inventer.
    expect(toDriver({ ...base, matricule: null }).matricule).toBe('')
    expect(toDriver({ ...base, matricule: 'MAT-0012' }).matricule).toBe('MAT-0012')
  })

  it('reprend les compétences déjà désérialisées par le serveur', () => {
    expect(toDriver({ ...base, skills: ['Camion', 'Pelle'] }).skills).toEqual(['Camion', 'Pelle'])
    expect(toDriver({ ...base, skills: null }).skills).toEqual([])
  })
})

describe('Mission', () => {
  const base = {
    id: 'm1',
    code: 'MS-1042',
    site: 'PK 12+500 — Yamoussoukro',
    startDate: '2026-09-01T08:00:00',
    endDate: '2026-09-05T18:00:00',
    status: 'EN_COURS',
    vehicleId: 'v1',
    driverId: 'd1',
    budget: 250000,
    createdAt: '2026-08-30T10:00:00',
  }

  it('traduit les quatre statuts', () => {
    expect(toMission({ ...base, status: 'AFFECTEE' }).status).toBe('affectee')
    expect(toMission({ ...base, status: 'EN_COURS' }).status).toBe('en_cours')
    expect(toMission({ ...base, status: 'CONTROLE' }).status).toBe('controle')
    expect(toMission({ ...base, status: 'CLOTUREE' }).status).toBe('cloturee')
  })

  it('n’invente pas de relevé quand le kilométrage n’a pas été saisi', () => {
    // Un relevé rempli de zéros se lirait comme une mesure : l'absence doit
    // rester une absence.
    const m = toMission(base)
    expect(m.departure).toBeUndefined()
    expect(m.arrival).toBeUndefined()
  })

  it('construit le relevé dès que le kilométrage existe', () => {
    const m = toMission({ ...base, departureKm: 52340, departureEngineHours: 1243, departureFuel: 80 })
    expect(m.departure?.km).toBe(52340)
    expect(m.departure?.engineHours).toBe(1243)
    expect(m.departure?.fuelLevel).toBe(80)
  })

  it('ne déclare aucun point de contrôle vérifié', () => {
    // Le serveur ne porte pas encore la liste : afficher des cases cochées
    // affirmerait un contrôle qui n'a pas eu lieu.
    const m = toMission({ ...base, departureKm: 100 })
    expect(m.departure?.checklist).toEqual({
      pneus: false, freins: false, eclairage: false, carrosserie: false,
    })
  })

  it('ne retient dans la chronologie que les étapes réellement franchies', () => {
    const jeune = toMission(base)
    expect(jeune.timeline.map((e) => e.label)).toEqual(['Mission créée'])

    const avancee = toMission({ ...base, departureKm: 100, arrivalKm: 400, status: 'CONTROLE' })
    expect(avancee.timeline.map((e) => e.label)).toEqual([
      'Mission créée', 'Départ enregistré', 'Retour enregistré',
    ])
  })

  it('traite un budget absent comme zéro', () => {
    expect(toMission({ ...base, budget: null }).budget).toBe(0)
  })
})

describe('Alerte', () => {
  const base = {
    id: 'fuel-low:v1',
    severity: 'urgent',
    title: 'Carburant critique',
    detail: 'ENG-002 : niveau à 12 %',
    time: '2026-09-04T09:12:00',
  }

  it('conserve les trois niveaux de gravité', () => {
    expect(toAlert({ ...base, severity: 'urgent' }).severity).toBe('urgent')
    expect(toAlert({ ...base, severity: 'attention' }).severity).toBe('attention')
    expect(toAlert({ ...base, severity: 'info' }).severity).toBe('info')
  })

  it('rétrograde une gravité inconnue en information', () => {
    // Mieux vaut afficher l'alerte au niveau le plus bas que la perdre.
    expect(toAlert({ ...base, severity: 'catastrophe' }).severity).toBe('info')
  })

  it('conserve un identifiant stable, tiré de la règle et de la ressource', () => {
    expect(toAlert(base).id).toBe('fuel-low:v1')
  })
})

describe('Plein de carburant', () => {
  it('fait correspondre le coût du serveur au montant de l’interface', () => {
    const e = toFuelEntry({ id: 'f1', quantity: 45.5, cost: 30000, station: 'Total Abidjan Port' })
    expect(e.liters).toBe(45.5)
    expect(e.amount).toBe(30000)
    expect(e.station).toBe('Total Abidjan Port')
  })
})
