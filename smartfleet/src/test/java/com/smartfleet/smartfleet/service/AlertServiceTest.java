package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.dto.FleetAlertResponse;
import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Règles de dérivation des alertes.
 *
 * Ces tests fixent les seuils métier : une alerte qui se déclenche trop tôt
 * devient du bruit et fait ignorer les autres, une alerte qui se déclenche trop
 * tard arrive après l'incident.
 */
class AlertServiceTest {

    private VehicleRepository vehicles;
    private MissionRepository missions;
    private DriverRepository drivers;
    private AlertService service;

    @BeforeEach
    void setUp() {
        vehicles = Mockito.mock(VehicleRepository.class);
        missions = Mockito.mock(MissionRepository.class);
        drivers = Mockito.mock(DriverRepository.class);

        when(vehicles.findAll()).thenReturn(List.of());
        when(missions.findAll()).thenReturn(List.of());
        when(drivers.findAll()).thenReturn(List.of());

        service = new AlertService(vehicles, missions, drivers);
    }

    private Vehicle vehicle(int fuel, VehicleStatus status, VehicleCondition condition) {
        Vehicle v = new Vehicle();
        v.setId("veh-1");
        v.setCode("VH-0042");
        v.setName("Toyota Hilux");
        v.setFuelLevel(fuel);
        v.setStatus(status);
        v.setCondition(condition);
        return v;
    }

    private Driver driver(DriverStatus status) {
        Driver d = new Driver();
        d.setId("drv-1");
        d.setName("KOUASSI Jean");
        d.setStatus(status);
        return d;
    }

    private boolean hasRule(List<FleetAlertResponse> alerts, String rule) {
        return alerts.stream().anyMatch(a -> rule.equals(a.getRule()));
    }

    private FleetAlertResponse byRule(List<FleetAlertResponse> alerts, String rule) {
        return alerts.stream().filter(a -> rule.equals(a.getRule())).findFirst().orElseThrow();
    }

    @Test
    @DisplayName("Une flotte saine ne produit aucune alerte")
    void flotteSaine() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle(80, VehicleStatus.DISPONIBLE, VehicleCondition.BON)));

        assertTrue(service.currentAlerts().isEmpty());
    }

    @Nested
    @DisplayName("Carburant")
    class Carburant {

        @Test
        @DisplayName("Au-dessus du seuil, aucune alerte")
        void auDessusDuSeuil() {
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(AlertService.FUEL_LOW + 1, VehicleStatus.DISPONIBLE, VehicleCondition.BON)));

            assertFalse(hasRule(service.currentAlerts(), "FUEL_LOW"));
        }

        @Test
        @DisplayName("Sous le seuil bas, alerte d'attention")
        void seuilBas() {
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(AlertService.FUEL_LOW, VehicleStatus.DISPONIBLE, VehicleCondition.BON)));

            var alert = byRule(service.currentAlerts(), "FUEL_LOW");
            assertEquals(FleetAlertResponse.ATTENTION, alert.getSeverity());
        }

        @Test
        @DisplayName("Sous le seuil critique, l'alerte devient urgente")
        void seuilCritique() {
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(AlertService.FUEL_CRITICAL, VehicleStatus.DISPONIBLE, VehicleCondition.BON)));

            var alert = byRule(service.currentAlerts(), "FUEL_LOW");
            assertEquals(FleetAlertResponse.URGENT, alert.getSeverity());
            assertTrue(alert.getDetail().contains("ravitaillement"));
        }

        @Test
        @DisplayName("Un niveau inconnu n'alerte pas")
        void niveauInconnu() {
            // Une donnée absente n'est pas un niveau de zéro : alerter ici
            // ferait remonter tous les véhicules mal renseignés en urgence.
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(0, VehicleStatus.DISPONIBLE, VehicleCondition.BON)));
            var v = vehicle(0, VehicleStatus.DISPONIBLE, VehicleCondition.BON);
            v.setFuelLevel(null);
            when(vehicles.findAll()).thenReturn(List.of(v));

            assertFalse(hasRule(service.currentAlerts(), "FUEL_LOW"));
        }
    }

    @Nested
    @DisplayName("Disponibilité et état")
    class Disponibilite {

        @Test
        @DisplayName("Un véhicule hors service est une urgence")
        void horsService() {
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(80, VehicleStatus.HORS_SERVICE, VehicleCondition.BON)));

            var alert = byRule(service.currentAlerts(), "VEHICLE_OUT_OF_SERVICE");
            assertEquals(FleetAlertResponse.URGENT, alert.getSeverity());
        }

        @Test
        @DisplayName("Une maintenance est signalée sans être urgente")
        void maintenance() {
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(80, VehicleStatus.MAINTENANCE, VehicleCondition.BON)));

            var alert = byRule(service.currentAlerts(), "VEHICLE_MAINTENANCE");
            assertEquals(FleetAlertResponse.ATTENTION, alert.getSeverity());
        }

        @Test
        @DisplayName("Un véhicule en mauvais état encore affectable est une urgence")
        void mauvaisEtatAffectable() {
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(80, VehicleStatus.DISPONIBLE, VehicleCondition.MAUVAIS)));

            // C'est le cas qui compte : il peut partir en mission alors qu'il ne
            // devrait pas.
            var alert = byRule(service.currentAlerts(), "VEHICLE_CONDITION_BAD");
            assertEquals(FleetAlertResponse.URGENT, alert.getSeverity());
        }

        @Test
        @DisplayName("En mauvais état mais déjà immobilisé, l'alerte redescend")
        void mauvaisEtatImmobilise() {
            when(vehicles.findAll()).thenReturn(List.of(
                vehicle(80, VehicleStatus.MAINTENANCE, VehicleCondition.MAUVAIS)));

            var alert = byRule(service.currentAlerts(), "VEHICLE_CONDITION_BAD");
            assertEquals(FleetAlertResponse.ATTENTION, alert.getSeverity());
        }
    }

    @Nested
    @DisplayName("Missions en retard")
    class Missions {

        private Mission mission(LocalDateTime end, MissionStatus status) {
            Mission m = new Mission();
            m.setId("mis-1");
            m.setCode("MS-1042");
            m.setEndDate(end);
            m.setStatus(status);
            return m;
        }

        @Test
        @DisplayName("Un léger dépassement ne déclenche pas d'alerte")
        void toleranceDeQuelquesHeures() {
            // Quelques heures de dépassement restent courantes sur le terrain.
            when(missions.findAll()).thenReturn(List.of(
                mission(LocalDateTime.now().minusHours(2), MissionStatus.EN_COURS)));

            assertFalse(hasRule(service.currentAlerts(), "MISSION_OVERDUE"));
        }

        @Test
        @DisplayName("Au-delà de la tolérance, la mission est signalée")
        void retardSignale() {
            when(missions.findAll()).thenReturn(List.of(
                mission(LocalDateTime.now().minusHours(20), MissionStatus.EN_COURS)));

            var alert = byRule(service.currentAlerts(), "MISSION_OVERDUE");
            assertEquals(FleetAlertResponse.ATTENTION, alert.getSeverity());
            assertTrue(alert.getDetail().contains("MS-1042"));
        }

        @Test
        @DisplayName("Au-delà de trois jours, le retard devient urgent")
        void retardImportant() {
            when(missions.findAll()).thenReturn(List.of(
                mission(LocalDateTime.now().minusDays(4), MissionStatus.EN_COURS)));

            assertEquals(FleetAlertResponse.URGENT,
                byRule(service.currentAlerts(), "MISSION_OVERDUE").getSeverity());
        }

        @Test
        @DisplayName("Une mission clôturée n'alerte jamais, même en retard")
        void missionCloturee() {
            when(missions.findAll()).thenReturn(List.of(
                mission(LocalDateTime.now().minusDays(10), MissionStatus.CLOTUREE)));

            assertFalse(hasRule(service.currentAlerts(), "MISSION_OVERDUE"));
        }

        @Test
        @DisplayName("Une mission sans échéance n'alerte pas")
        void sansEcheance() {
            when(missions.findAll()).thenReturn(List.of(
                mission(null, MissionStatus.EN_COURS)));

            assertFalse(hasRule(service.currentAlerts(), "MISSION_OVERDUE"));
        }
    }

    @Nested
    @DisplayName("Permis")
    class Permis {

        private Driver withExpiry(LocalDate expiry) {
            Driver d = driver(DriverStatus.DISPONIBLE);
            d.setLicenseExpiryDate(expiry);
            return d;
        }

        @Test
        @DisplayName("Un permis expiré est une urgence")
        void permisExpire() {
            when(drivers.findAll()).thenReturn(List.of(withExpiry(LocalDate.now().minusDays(5))));

            var alert = byRule(service.currentAlerts(), "LICENSE_EXPIRED");
            assertEquals(FleetAlertResponse.URGENT, alert.getSeverity());
            assertTrue(alert.getDetail().contains("suspendre"));
        }

        @Test
        @DisplayName("Dans la fenêtre de préavis, le renouvellement est signalé")
        void permisProcheExpiration() {
            when(drivers.findAll()).thenReturn(List.of(
                withExpiry(LocalDate.now().plusDays(AlertService.LICENSE_WARNING_DAYS - 1))));

            assertEquals(FleetAlertResponse.ATTENTION,
                byRule(service.currentAlerts(), "LICENSE_EXPIRING").getSeverity());
        }

        @Test
        @DisplayName("Au-delà du préavis, aucune alerte")
        void permisValide() {
            when(drivers.findAll()).thenReturn(List.of(
                withExpiry(LocalDate.now().plusDays(AlertService.LICENSE_WARNING_DAYS + 10))));

            var alerts = service.currentAlerts();
            assertFalse(hasRule(alerts, "LICENSE_EXPIRING"));
            assertFalse(hasRule(alerts, "LICENSE_EXPIRED"));
        }

        @Test
        @DisplayName("Une échéance non renseignée n'alerte pas")
        void echeanceAbsente() {
            // Le manque est remonté dans la synthèse de flotte, pas transformé
            // en alerte qui serait du bruit sur tout un parc mal renseigné.
            when(drivers.findAll()).thenReturn(List.of(withExpiry(null)));

            assertTrue(service.currentAlerts().isEmpty());
        }
    }

    @Test
    @DisplayName("Un conducteur indisponible est signalé pour information")
    void conducteurIndisponible() {
        when(drivers.findAll()).thenReturn(List.of(driver(DriverStatus.INDISPONIBLE)));

        assertEquals(FleetAlertResponse.INFO,
            byRule(service.currentAlerts(), "DRIVER_UNAVAILABLE").getSeverity());
    }

    @Test
    @DisplayName("Les urgences remontent en tête")
    void triParGravite() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle(80, VehicleStatus.MAINTENANCE, VehicleCondition.BON),
            vehicle(5, VehicleStatus.DISPONIBLE, VehicleCondition.BON)));
        when(drivers.findAll()).thenReturn(List.of(driver(DriverStatus.INDISPONIBLE)));

        var alerts = service.currentAlerts();
        assertEquals(FleetAlertResponse.URGENT, alerts.get(0).getSeverity());
        assertEquals(FleetAlertResponse.INFO, alerts.get(alerts.size() - 1).getSeverity());
    }

    @Test
    @DisplayName("L'identifiant d'une alerte reste stable tant que la cause dure")
    void identifiantStable() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle(10, VehicleStatus.DISPONIBLE, VehicleCondition.BON)));

        // Deux lectures successives de la même situation doivent produire la
        // même alerte : sans cela l'interface la verrait comme nouvelle à
        // chaque rafraîchissement.
        assertEquals(
            byRule(service.currentAlerts(), "FUEL_LOW").getId(),
            byRule(service.currentAlerts(), "FUEL_LOW").getId());
    }

    @Test
    @DisplayName("Un conducteur ne voit que ce qui le concerne")
    void alertesDuConducteur() {
        Driver mine = driver(DriverStatus.DISPONIBLE);

        Driver other = new Driver();
        other.setId("drv-other");
        other.setName("Autre");

        Vehicle myVehicle = vehicle(10, VehicleStatus.DISPONIBLE, VehicleCondition.BON);
        myVehicle.setAssignedDriver(mine);

        Vehicle otherVehicle = vehicle(5, VehicleStatus.DISPONIBLE, VehicleCondition.BON);
        otherVehicle.setId("veh-other");
        otherVehicle.setAssignedDriver(other);

        when(vehicles.findAll()).thenReturn(List.of(myVehicle, otherVehicle));

        var alerts = service.alertsForDriver(mine.getId());
        assertEquals(1, alerts.size());
        assertEquals(myVehicle.getId(), alerts.get(0).getResourceId());
    }
}
