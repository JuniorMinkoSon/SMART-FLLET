-- V003 : champs métier attendus par le client
--
-- Le contrat côté interface porte déjà ces informations ; le modèle ne les
-- stockait pas, et les écrans se rabattaient sur des données simulées. Cette
-- migration comble l'écart plutôt que d'amputer le contrat.
--
-- Toutes les colonnes sont nullables : la flotte existante ne peut pas être
-- rétroactivement renseignée, et une contrainte NOT NULL rendrait la migration
-- impossible à appliquer sur des données réelles.

-- Désignation d'usage, distincte du code d'inventaire : sur le terrain un engin
-- s'appelle « Pelle Komatsu 210 », pas « VH-0042 ».
ALTER TABLE vehicles ADD COLUMN name VARCHAR(255);

-- État général, indépendant de la disponibilité : un engin peut être disponible
-- et en mauvais état, ou en mission et en bon état. Le premier conditionne
-- l'affectation, le second déclenche l'entretien.
-- Sans contrainte NOT NULL : elle empêcherait l'ajout sur une flotte déjà
-- enregistrée. La valeur par défaut est garantie côté application.
ALTER TABLE vehicles ADD COLUMN vehicle_condition VARCHAR(20) DEFAULT 'BON';

-- Site d'affectation, pour le filtrage et le regroupement de la flotte.
ALTER TABLE vehicles ADD COLUMN site VARCHAR(255);

-- Conducteur affecté au véhicule.
--
-- Distinct du conducteur d'une mission, porté par missions.driver_id : celui-ci
-- change à chaque course, l'affectation ici est durable. La contrainte n'est pas
-- en cascade — retirer un conducteur ne doit pas effacer le véhicule.
ALTER TABLE vehicles ADD COLUMN assigned_driver_id VARCHAR(36);

ALTER TABLE vehicles
    ADD CONSTRAINT fk_vehicles_assigned_driver
    FOREIGN KEY (assigned_driver_id) REFERENCES drivers (id);

CREATE INDEX idx_vehicles_assigned_driver ON vehicles (assigned_driver_id);

-- Chemin d'accès du filtre de flotte par site.
CREATE INDEX idx_vehicles_site ON vehicles (site);

-- Matricule du conducteur.
--
-- Donnée métier propre, non dérivée de l'identifiant technique : il figure sur
-- les documents de mission, doit être recherchable tel quel, et suit le salarié
-- indépendamment de la génération des clés. Unique, mais nullable pour ne pas
-- bloquer les enregistrements déjà en base.
ALTER TABLE drivers ADD COLUMN matricule VARCHAR(50);

ALTER TABLE drivers
    ADD CONSTRAINT uk_drivers_matricule UNIQUE (matricule);

-- Échéance de validité du permis.
--
-- Conditionne l'affectation : un conducteur dont le permis a expiré ne peut pas
-- prendre de mission. Sans cette date, l'expiration ne se découvre qu'au
-- contrôle routier. Nullable pour ne pas bloquer les fiches déjà en base.
ALTER TABLE drivers ADD COLUMN license_expiry_date DATE;

-- Chemin d'accès de la règle d'alerte sur les permis proches d'expirer.
CREATE INDEX idx_drivers_license_expiry ON drivers (license_expiry_date);
