package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Projection des entités vers les vues exposées.
 *
 * Ces tests fixent le contrat consommé par l'interface : un renommage de champ
 * ou un état par défaut modifié se verrait ici plutôt qu'à l'écran.
 */
class ResponseMappingTest {

    @Nested
    @DisplayName("VehicleResponse")
    class VehicleMapping {

        private Vehicle vehicle() {
            Vehicle v = new Vehicle();
            v.setId("veh-1");
            v.setCode("VH-0042");
            v.setType("Pelle");
            v.setName("Pelle Komatsu 210");
            v.setLicensePlate("AB-123-CD");
            v.setStatus(VehicleStatus.DISPONIBLE);
            v.setInitialKm(1000);
            v.setCurrentKm(52430);
            v.setEngineHours(1243);
            v.setFuelLevel(66);
            v.setCondition(VehicleCondition.BON);
            v.setSite("Abidjan");
            return v;
        }

        @Test
        @DisplayName("Le vocabulaire suit le contrat de l'interface : plate et km")
        void renommageDesChamps() {
            var r = VehicleResponse.from(vehicle());

            assertEquals("AB-123-CD", r.getPlate());
            assertEquals(52430, r.getKm());
        }

        @Test
        @DisplayName("Les champs métier ajoutés sont exposés")
        void champsMetier() {
            var r = VehicleResponse.from(vehicle());

            assertEquals("Pelle Komatsu 210", r.getName());
            assertEquals("Bon", r.getCondition());
            assertEquals("Abidjan", r.getSite());
        }

        @Test
        @DisplayName("Le conducteur affecté est exposé par son identifiant et son nom")
        void conducteurAffecte() {
            Driver d = new Driver();
            d.setId("drv-9");
            d.setName("K. Kouassi");

            Vehicle v = vehicle();
            v.setAssignedDriver(d);

            var r = VehicleResponse.from(v);
            assertEquals("drv-9", r.getDriverId());
            assertEquals("K. Kouassi", r.getDriverName());
        }

        @Test
        @DisplayName("Un véhicule sans conducteur affecté reste valide")
        void sansConducteur() {
            var r = VehicleResponse.from(vehicle());

            assertNull(r.getDriverId());
            assertNull(r.getDriverName());
        }

        @Test
        @DisplayName("Un état absent est présenté comme bon, jamais vide")
        void etatAbsent() {
            Vehicle v = vehicle();
            v.setCondition(null);

            // Le client affiche cette valeur telle quelle et n'a pas de cas
            // « inconnu » : une chaîne vide laisserait une colonne blanche.
            assertEquals("Bon", VehicleResponse.from(v).getCondition());
        }

        @Test
        @DisplayName("Chaque état a son libellé")
        void libellesEtat() {
            Vehicle v = vehicle();

            v.setCondition(VehicleCondition.MOYEN);
            assertEquals("Moyen", VehicleResponse.from(v).getCondition());

            v.setCondition(VehicleCondition.MAUVAIS);
            assertEquals("Mauvais", VehicleResponse.from(v).getCondition());
        }
    }

    @Nested
    @DisplayName("DriverResponse")
    class DriverMapping {

        private Driver driver() {
            Driver d = new Driver();
            d.setId("drv-1");
            d.setName("KOUASSI Jean");
            d.setMatricule("MAT-0012");
            d.setEmail("kouassi@smartfleet.ci");
            d.setPhone("+225 07 00 00 00");
            d.setLicenseType("C");
            d.setStatus(DriverStatus.DISPONIBLE);
            return d;
        }

        @Test
        @DisplayName("Le matricule est exposé tel qu'il est saisi")
        void matricule() {
            assertEquals("MAT-0012", DriverResponse.from(driver()).getMatricule());
        }

        @Test
        @DisplayName("Le type de permis est exposé sous le nom attendu par l'interface")
        void typeDePermis() {
            assertEquals("C", DriverResponse.from(driver()).getLicense());
        }

        @Test
        @DisplayName("L'échéance du permis est exposée quand elle est renseignée")
        void echeancePermis() {
            Driver d = driver();
            LocalDate expiry = LocalDate.of(2027, 6, 30);
            d.setLicenseExpiryDate(expiry);

            assertEquals(expiry, DriverResponse.from(d).getLicenseExpiryDate());
            assertNull(DriverResponse.from(driver()).getLicenseExpiryDate());
        }

        @Test
        @DisplayName("Les compétences stockées en JSON sont désérialisées")
        void competencesJson() {
            Driver d = driver();
            d.setSkills("[\"Conduite tout-terrain\", \"Manutention\"]");

            var skills = DriverResponse.from(d).getSkills();
            assertEquals(2, skills.size());
            assertTrue(skills.contains("Conduite tout-terrain"));
            assertTrue(skills.contains("Manutention"));
        }

        @Test
        @DisplayName("Une liste séparée par des virgules est acceptée aussi")
        void competencesTexteSimple() {
            Driver d = driver();
            d.setSkills("Conduite, Manutention, Levage");

            // Les deux formes coexistent en base selon l'origine de la fiche :
            // n'en accepter qu'une ferait disparaître les compétences d'une partie
            // des conducteurs.
            assertEquals(3, DriverResponse.from(d).getSkills().size());
        }

        @Test
        @DisplayName("L'ordre de saisie est conservé")
        void ordreConserve() {
            Driver d = driver();
            d.setSkills("Levage, Conduite, Manutention");

            // La compétence principale est souvent citée en premier.
            assertEquals("Levage", DriverResponse.from(d).getSkills().iterator().next());
        }

        @Test
        @DisplayName("Des compétences absentes donnent une liste vide, pas null")
        void competencesAbsentes() {
            Driver d = driver();
            d.setSkills(null);
            assertTrue(DriverResponse.from(d).getSkills().isEmpty());

            d.setSkills("");
            assertTrue(DriverResponse.from(d).getSkills().isEmpty());

            d.setSkills("[]");
            assertTrue(DriverResponse.from(d).getSkills().isEmpty());
        }

        @Test
        @DisplayName("Les valeurs vides d'une liste sont ignorées")
        void valeursVides() {
            assertEquals(2, DriverResponse.parseList("Conduite, , Levage,").size());
        }

        @Test
        @DisplayName("Une liste doublement encodée est déballée")
        void listeDoublementEncodee() {
            // Cas observé en base : une chaîne JSON contenant elle-même un
            // tableau JSON échappé. Sans déballage, les compétences ressortaient
            // avec leurs barres obliques et s'affichaient telles quelles.
            var skills = DriverResponse.parseList("\"[\\\"Camion\\\", \\\"Pelle\\\"]\"");

            assertEquals(2, skills.size());
            assertTrue(skills.contains("Camion"), "obtenu : " + skills);
            assertTrue(skills.contains("Pelle"), "obtenu : " + skills);
        }
    }

    @Nested
    @DisplayName("VehicleCondition")
    class ConditionParsing {

        @Test
        @DisplayName("La constante comme le libellé sont acceptés")
        void lectureTolerante() {
            assertEquals(VehicleCondition.MAUVAIS, VehicleCondition.from("MAUVAIS"));
            assertEquals(VehicleCondition.MAUVAIS, VehicleCondition.from("Mauvais"));
            assertEquals(VehicleCondition.BON, VehicleCondition.from("bon"));
        }

        @Test
        @DisplayName("Une valeur absente vaut bon état")
        void valeurAbsente() {
            assertEquals(VehicleCondition.BON, VehicleCondition.from(null));
            assertEquals(VehicleCondition.BON, VehicleCondition.from("  "));
        }

        @Test
        @DisplayName("Une valeur inconnue retombe sur moyen plutôt que d'être rejetée")
        void valeurInconnue() {
            // Un véhicule mal qualifié doit rester visible, pas disparaître de
            // la flotte sur une erreur de saisie.
            assertEquals(VehicleCondition.MOYEN, VehicleCondition.from("DOUTEUX"));
        }
    }
}
