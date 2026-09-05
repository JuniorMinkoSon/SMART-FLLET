-- V005 : provenance des engins
--
-- Rien ne distinguait un engin appartenant à l'entreprise d'un engin loué. Les
-- deux ne se pilotent pourtant pas de la même façon : le second a un loyer, un
-- entretien à la charge du prestataire, et une date de restitution. Les
-- confondre fausse le coût de possession du parc propre.

ALTER TABLE vehicles ADD COLUMN ownership VARCHAR(20) DEFAULT 'INTERNE';

-- Prestataire propriétaire, pour un engin externe.
ALTER TABLE vehicles ADD COLUMN owner_company VARCHAR(255);

-- Fin de mise à disposition. Passée cette date, l'engin ne devrait plus être
-- affecté : c'est ce qui permet de le signaler avant qu'une mission ne soit
-- planifiée dessus.
ALTER TABLE vehicles ADD COLUMN contract_end_date DATE;

-- Chemin d'accès du filtre de flotte par provenance.
CREATE INDEX idx_vehicles_ownership ON vehicles (ownership);
