-- V004 : contrôles et interventions de maintenance
--
-- Ces deux tables comblent le chaînon manquant du cycle de vie d'un véhicule :
-- rien ne faisait jusqu'ici passer un engin de CONTROLE à MAINTENANCE, et rien
-- ne conservait ce qui avait été vérifié.

-- Contrôles.
--
-- Un contrôle constate un état à un instant donné et engage celui qui l'a fait :
-- après un incident, la question posée est toujours « qui a vérifié quoi ».
CREATE TABLE inspections (
    id              VARCHAR(36) PRIMARY KEY,
    vehicle_id      VARCHAR(36) NOT NULL REFERENCES vehicles (id),

    -- Facultative : un contrôle quotidien au dépôt ne concerne aucune mission,
    -- et l'exiger empêcherait de le saisir.
    mission_id      VARCHAR(36) REFERENCES missions (id),

    inspection_type VARCHAR(30) NOT NULL DEFAULT 'PERIODIQUE',

    -- Colonnes distinctes plutôt qu'un document JSON : ce sont des critères
    -- stables qu'on veut pouvoir interroger directement.
    tyres_ok        BOOLEAN NOT NULL DEFAULT FALSE,
    brakes_ok       BOOLEAN NOT NULL DEFAULT FALSE,
    lights_ok       BOOLEAN NOT NULL DEFAULT FALSE,
    bodywork_ok     BOOLEAN NOT NULL DEFAULT FALSE,

    -- « result » est un mot réservé du moteur : la colonne est nommée
    -- explicitement pour que la requête générée reste valide.
    inspection_result VARCHAR(20) NOT NULL DEFAULT 'OK',
    anomaly         TEXT,
    km_reading      INT,

    inspector_id    VARCHAR(36) REFERENCES users (id),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_inspection_type
        CHECK (inspection_type IN ('AVANT_DEPART', 'APRES_MISSION', 'QUOTIDIEN', 'PERIODIQUE')),
    CONSTRAINT chk_inspection_result
        CHECK (inspection_result IN ('OK', 'ATTENTION', 'CRITIQUE'))
);

CREATE INDEX idx_inspections_vehicle ON inspections (vehicle_id);
CREATE INDEX idx_inspections_mission ON inspections (mission_id);

-- Chemin d'accès du tableau de bord : les contrôles bloquants d'abord.
CREATE INDEX idx_inspections_critical ON inspections (inspection_result, created_at);

-- Interventions de maintenance.
--
-- Couvre l'entretien planifié comme la réparation consécutive à un contrôle
-- critique : même cycle, même besoin de suivi des coûts.
CREATE TABLE maintenances (
    id               VARCHAR(36) PRIMARY KEY,
    vehicle_id       VARCHAR(36) NOT NULL REFERENCES vehicles (id),

    -- Relie la réparation au défaut constaté. Sans ce lien, on sait qu'un engin
    -- a été réparé mais plus pourquoi.
    inspection_id    VARCHAR(36) REFERENCES inspections (id),

    maintenance_type VARCHAR(30) NOT NULL DEFAULT 'CORRECTIVE',
    status           VARCHAR(20) NOT NULL DEFAULT 'PLANIFIEE',
    description      TEXT NOT NULL,

    scheduled_date   DATE,
    completed_date   DATE,

    -- Renseigné à la clôture : au moment de planifier le coût est inconnu, et
    -- exiger une estimation ferait entrer des chiffres inventés dans les
    -- indicateurs de flotte.
    cost             INT,

    provider         VARCHAR(255),
    km_reading       INT,
    notes            TEXT,

    created_by       VARCHAR(36) REFERENCES users (id),
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP,

    CONSTRAINT chk_maintenance_type
        CHECK (maintenance_type IN ('PREVENTIVE', 'CORRECTIVE', 'REGLEMENTAIRE')),
    CONSTRAINT chk_maintenance_status
        CHECK (status IN ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE')),

    -- Une intervention terminée porte sa date de clôture : sans elle, elle
    -- n'apparaîtrait dans aucun bilan de période.
    CONSTRAINT chk_maintenance_completion
        CHECK (status <> 'TERMINEE' OR completed_date IS NOT NULL)
);

CREATE INDEX idx_maintenances_vehicle ON maintenances (vehicle_id);
CREATE INDEX idx_maintenances_status ON maintenances (status);

-- Chemin d'accès du planning d'atelier : ce qui reste à faire, par échéance.
CREATE INDEX idx_maintenances_planning ON maintenances (status, scheduled_date);
