package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.FuelEntryRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Synthèse de flotte.
 *
 * Les agrégats servent de base aux décisions du responsable : un taux de
 * disponibilité faux ou un budget mal cumulé se voit ici avant d'atteindre un
 * tableau de bord.
 */
class ReportServiceTest {

    private VehicleRepository vehicles;
    private MissionRepository missions;
    private DriverRepository drivers;
    private FuelEntryRepository fuelEntries;
    private ReportService service;

    @BeforeEach
    void setUp() {
        vehicles = Mockito.mock(VehicleRepository.class);
        missions = Mockito.mock(MissionRepository.class);
        drivers = Mockito.mock(DriverRepository.class);
        fuelEntries = Mockito.mock(FuelEntryRepository.class);

        when(vehicles.findAll()).thenReturn(List.of());
        when(missions.findAll()).thenReturn(List.of());
        when(drivers.findAll()).thenReturn(List.of());
        when(fuelEntries.findAll()).thenReturn(List.of());

        AlertService alertService = new AlertService(vehicles, missions, drivers);
        service = new ReportService(vehicles, missions, drivers, fuelEntries, alertService);
    }

    private Vehicle vehicle(String id, VehicleStatus status, int km, int fuel, String site) {
        Vehicle v = new Vehicle();
        v.setId(id);
        v.setCode(id);
        v.setStatus(status);
        v.setCurrentKm(km);
        v.setEngineHours(100);
        v.setFuelLevel(fuel);
        v.setSite(site);
        v.setCondition(VehicleCondition.BON);
        return v;
    }

    @Test
    @DisplayName("Une flotte vide donne des compteurs à zéro, sans division par zéro")
    void flotteVide() {
        var report = service.buildReport();

        assertEquals(0, report.getFleet().getTotal());
        assertEquals(0, report.getFleet().getAvailabilityRate());
        assertNotNull(report.getGeneratedAt());
    }

    @Test
    @DisplayName("Le taux de disponibilité reflète les véhicules affectables")
    void tauxDeDisponibilite() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle("v1", VehicleStatus.DISPONIBLE, 1000, 80, "Abidjan"),
            vehicle("v2", VehicleStatus.DISPONIBLE, 2000, 80, "Abidjan"),
            vehicle("v3", VehicleStatus.EN_MISSION, 3000, 80, "Bouaké"),
            vehicle("v4", VehicleStatus.MAINTENANCE, 4000, 80, "Bouaké")));

        var fleet = service.buildReport().getFleet();

        assertEquals(4, fleet.getTotal());
        assertEquals(2, fleet.getAvailable());
        assertEquals(50, fleet.getAvailabilityRate());
    }

    @Test
    @DisplayName("Maintenance et hors service comptent tous deux comme immobilisation")
    void immobilisations() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle("v1", VehicleStatus.MAINTENANCE, 0, 80, "Abidjan"),
            vehicle("v2", VehicleStatus.HORS_SERVICE, 0, 80, "Abidjan"),
            vehicle("v3", VehicleStatus.DISPONIBLE, 0, 80, "Abidjan")));

        assertEquals(2, service.buildReport().getFleet().getImmobilized());
    }

    @Test
    @DisplayName("Les kilométrages et heures moteur sont cumulés")
    void cumuls() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle("v1", VehicleStatus.DISPONIBLE, 12000, 80, "Abidjan"),
            vehicle("v2", VehicleStatus.DISPONIBLE, 8000, 80, "Abidjan")));

        var fleet = service.buildReport().getFleet();
        assertEquals(20000, fleet.getTotalKm());
        assertEquals(200, fleet.getTotalEngineHours());
    }

    @Test
    @DisplayName("Les véhicules sans site sont regroupés plutôt qu'ignorés")
    void vehiculesSansSite() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle("v1", VehicleStatus.DISPONIBLE, 0, 80, null),
            vehicle("v2", VehicleStatus.DISPONIBLE, 0, 80, "  "),
            vehicle("v3", VehicleStatus.DISPONIBLE, 0, 80, "Abidjan")));

        // Leur nombre signale un défaut de saisie qu'il faut pouvoir voir.
        var bySite = service.buildReport().getFleet().getBySite();
        assertEquals(2, bySite.get("Non affecté"));
        assertEquals(1, bySite.get("Abidjan"));
    }

    @Test
    @DisplayName("Les véhicules sans conducteur affecté sont comptés")
    void sansConducteur() {
        Driver d = new Driver();
        d.setId("drv-1");

        Vehicle assigned = vehicle("v1", VehicleStatus.DISPONIBLE, 0, 80, "Abidjan");
        assigned.setAssignedDriver(d);

        when(vehicles.findAll()).thenReturn(List.of(
            assigned,
            vehicle("v2", VehicleStatus.DISPONIBLE, 0, 80, "Abidjan")));

        assertEquals(1, service.buildReport().getFleet().getWithoutDriver());
    }

    @Test
    @DisplayName("Missions actives, clôturées et en retard sont distinguées")
    void syntheseMissions() {
        Mission active = new Mission();
        active.setId("m1");
        active.setStatus(MissionStatus.EN_COURS);
        active.setEndDate(LocalDateTime.now().plusDays(1));
        active.setBudget(100_000L);

        Mission late = new Mission();
        late.setId("m2");
        late.setStatus(MissionStatus.EN_COURS);
        late.setEndDate(LocalDateTime.now().minusDays(2));
        late.setBudget(50_000L);

        Mission done = new Mission();
        done.setId("m3");
        done.setStatus(MissionStatus.CLOTUREE);
        done.setEndDate(LocalDateTime.now().minusDays(5));
        done.setBudget(25_000L);

        when(missions.findAll()).thenReturn(List.of(active, late, done));

        var summary = service.buildReport().getMissions();
        assertEquals(3, summary.getTotal());
        assertEquals(2, summary.getActive());
        assertEquals(1, summary.getCompleted());
        assertEquals(1, summary.getOverdue());
        assertEquals(175_000L, summary.getTotalBudget());
    }

    @Test
    @DisplayName("Les matricules manquants sont remontés")
    void matriculesManquants() {
        Driver withMat = new Driver();
        withMat.setId("d1");
        withMat.setStatus(DriverStatus.DISPONIBLE);
        withMat.setMatricule("MAT-1");

        Driver without = new Driver();
        without.setId("d2");
        without.setStatus(DriverStatus.DISPONIBLE);

        Driver blank = new Driver();
        blank.setId("d3");
        blank.setStatus(DriverStatus.EN_MISSION);
        blank.setMatricule("   ");

        when(drivers.findAll()).thenReturn(List.of(withMat, without, blank));

        var summary = service.buildReport().getDrivers();
        assertEquals(3, summary.getTotal());
        assertEquals(2, summary.getAvailable());

        // Un matricule vide compte comme manquant : la colonne est renseignée
        // mais ne porte rien d'exploitable sur un document de mission.
        assertEquals(2, summary.getMissingMatricule());
    }

    @Test
    @DisplayName("Le carburant cumule quantités, coûts et niveau moyen")
    void syntheseCarburant() {
        FuelEntry e1 = new FuelEntry();
        e1.setQuantity(45.0);
        e1.setCost(30_000);
        e1.setStation("Total Abidjan Port");

        FuelEntry e2 = new FuelEntry();
        e2.setQuantity(30.5);
        e2.setCost(20_000);
        e2.setStation("Total Abidjan Port");

        when(fuelEntries.findAll()).thenReturn(List.of(e1, e2));
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle("v1", VehicleStatus.DISPONIBLE, 0, 60, "Abidjan"),
            vehicle("v2", VehicleStatus.DISPONIBLE, 0, 20, "Abidjan")));

        var fuel = service.buildReport().getFuel();
        assertEquals(2, fuel.getEntries());
        assertEquals(75.5, fuel.getTotalQuantity(), 0.01);
        assertEquals(50_000, fuel.getTotalCost());
        assertEquals(40, fuel.getAverageLevel());
        assertEquals(1, fuel.getLowFuelVehicles());
        assertEquals("Total Abidjan Port", fuel.getTopStations().get(0).getStation());
    }

    @Test
    @DisplayName("Le décompte d'alertes suit les mêmes règles que l'écran d'alertes")
    void alertesCoherentes() {
        when(vehicles.findAll()).thenReturn(List.of(
            vehicle("v1", VehicleStatus.HORS_SERVICE, 0, 80, "Abidjan"),
            vehicle("v2", VehicleStatus.MAINTENANCE, 0, 80, "Abidjan")));

        // Les règles ne sont pas dupliquées dans le rapport : elles sont
        // réutilisées, faute de quoi les deux vues divergeraient.
        var alerts = service.buildReport().getAlerts();
        assertEquals(1, alerts.get("urgent"));
        assertEquals(1, alerts.get("attention"));
        assertEquals(0, alerts.get("info"));
    }
}
