package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.exception.ConflictException;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * ANTI-OVERBOOKING — tests d'integration sur la vraie base (H2).
 * Le scenario de reference de la specification est le premier test.
 */
@SpringBootTest
@Transactional
class MissionOverbookingTest {

    @Autowired MissionService missionService;
    @Autowired MissionRepository missionRepository;
    @Autowired VehicleRepository vehicleRepository;
    @Autowired DriverRepository driverRepository;

    private Vehicle enginX;
    private Vehicle enginY;
    private Driver driverA;
    private Driver driverB;

    @BeforeEach
    void setUp() {
        missionRepository.deleteAll();

        enginX = vehicleRepository.save(Vehicle.builder()
            .code("TEST-X").type("Pelle").licensePlate("CI-TEST-X")
            .status(VehicleStatus.DISPONIBLE)
            .initialKm(0).currentKm(0).engineHours(0).fuelLevel(100).build());

        enginY = vehicleRepository.save(Vehicle.builder()
            .code("TEST-Y").type("Pelle").licensePlate("CI-TEST-Y")
            .status(VehicleStatus.DISPONIBLE)
            .initialKm(0).currentKm(0).engineHours(0).fuelLevel(100).build());

        driverA = driverRepository.save(Driver.builder()
            .name("Conducteur A").email("a-" + System.nanoTime() + "@test.ci")
            .phone("+2250700000001").status(DriverStatus.DISPONIBLE)
            .skills("[\"Pelle\"]").licenseType("C").vehicleCategories("[\"Pelle\"]").build());

        driverB = driverRepository.save(Driver.builder()
            .name("Conducteur B").email("b-" + System.nanoTime() + "@test.ci")
            .phone("+2250700000002").status(DriverStatus.DISPONIBLE)
            .skills("[\"Pelle\"]").licenseType("C").vehicleCategories("[\"Pelle\"]").build());
    }

    private LocalDateTime d(int day) {
        return LocalDateTime.of(2026, 9, day, 8, 0);
    }

    @Test
    @DisplayName("Scenario specification : Engin X 01->10 puis 05->15 doit etre refuse")
    void rejectsOverlappingAssignmentOnSameVehicle() {
        missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1_000_000L, "tester");

        assertThatThrownBy(() -> missionService.createMission(
                enginX.getId(), driverB.getId(),
                d(5), d(15), "Projet B", "Client B", 2_000_000L, "tester"))
            .isInstanceOf(ConflictException.class)
            .hasMessageContaining("TEST-X");

        assertThat(missionRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Le conflit expose les missions fautives et des engins alternatifs")
    void conflictCarriesDetailsAndAlternatives() {
        missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1_000_000L, "tester");

        try {
            missionService.createMission(enginX.getId(), driverB.getId(),
                d(5), d(15), "Projet B", "Client B", 1L, "tester");
            org.junit.jupiter.api.Assertions.fail("un ConflictException etait attendu");
        } catch (ConflictException ex) {
            assertThat(ex.getCode()).isEqualTo("VEHICLE_OVERBOOKED");
            assertThat(ex.getConflicts()).hasSize(1);
            assertThat(ex.getConflicts().get(0).site()).isEqualTo("Projet A");
            // TEST-Y est du meme type, disponible et libre sur la periode.
            assertThat(ex.getAlternatives())
                .extracting(ConflictException.AlternativeVehicle::code)
                .contains("TEST-Y");
        }
    }

    @Test
    @DisplayName("Un meme conducteur ne peut pas etre sur deux missions qui se chevauchent")
    void rejectsOverlappingAssignmentOnSameDriver() {
        missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1L, "tester");

        assertThatThrownBy(() -> missionService.createMission(
                enginY.getId(), driverA.getId(),
                d(8), d(12), "Projet B", "Client B", 1L, "tester"))
            .isInstanceOf(ConflictException.class)
            .hasMessageContaining("Conducteur A");
    }

    @Test
    @DisplayName("Des periodes disjointes sont acceptees")
    void acceptsNonOverlappingPeriods() {
        missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1L, "tester");

        assertThatCode(() -> missionService.createMission(
                enginX.getId(), driverA.getId(),
                d(11), d(20), "Projet B", "Client B", 1L, "tester"))
            .doesNotThrowAnyException();

        assertThat(missionRepository.findAll()).hasSize(2);
    }

    @Test
    @DisplayName("Le chevauchement d'un seul jour suffit a declencher le conflit")
    void rejectsSingleDayOverlap() {
        missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1L, "tester");

        assertThatThrownBy(() -> missionService.createMission(
                enginX.getId(), driverB.getId(),
                d(10), d(20), "Projet B", "Client B", 1L, "tester"))
            .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("Une mission cloturee libere l'engin pour la meme periode")
    void closedMissionFreesTheVehicle() {
        Mission first = missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1L, "tester");

        missionService.startMission(first.getId(), 100, 10, 90, "tester");
        missionService.endMission(first.getId(), 200, 20, 40, "tester");
        missionService.validateReturn(first.getId(), true, "tester");

        assertThatCode(() -> missionService.createMission(
                enginX.getId(), driverA.getId(),
                d(5), d(15), "Projet B", "Client B", 1L, "tester"))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Un engin en maintenance ne peut pas etre affecte")
    void rejectsVehicleUnderMaintenance() {
        enginX.setStatus(VehicleStatus.MAINTENANCE);
        vehicleRepository.save(enginX);

        assertThatThrownBy(() -> missionService.createMission(
                enginX.getId(), driverA.getId(),
                d(1), d(10), "Projet A", "Client A", 1L, "tester"))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("indisponible");
    }

    @Test
    @DisplayName("Une date de fin anterieure au debut est refusee")
    void rejectsInvertedPeriod() {
        assertThatThrownBy(() -> missionService.createMission(
                enginX.getId(), driverA.getId(),
                d(10), d(1), "Projet A", "Client A", 1L, "tester"))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("posterieure");
    }

    @Test
    @DisplayName("getAvailableVehicles exclut les engins occupes sur la periode")
    void availabilityExcludesBusyVehicles() {
        missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1L, "tester");

        List<Vehicle> available = missionService.getAvailableVehicles(d(5), d(8));
        assertThat(available).extracting(Vehicle::getCode).doesNotContain("TEST-X");
        assertThat(available).extracting(Vehicle::getCode).contains("TEST-Y");
    }

    @Test
    @DisplayName("La reaffectation d'une mission ne se bloque pas elle-meme")
    void reassignmentIgnoresTheMissionItself() {
        Mission m = missionService.createMission(enginX.getId(), driverA.getId(),
            d(1), d(10), "Projet A", "Client A", 1L, "tester");

        assertThatCode(() -> missionService.assignDriver(m.getId(), driverB.getId(), "tester"))
            .doesNotThrowAnyException();
    }
}
