package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class MissionServiceTest {
    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private AuditEventRepository auditEventRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MissionService missionService;

    private Vehicle vehicle;
    private Driver driver;
    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2026, 8, 28);
        endDate = LocalDate.of(2026, 8, 30);

        vehicle = Vehicle.builder()
            .id("v1")
            .code("ENG-001")
            .type("CAMION")
            .licensePlate("CI-2024-001")
            .status(VehicleStatus.DISPONIBLE)
            .initialKm(1000)
            .currentKm(1000)
            .engineHours(100)
            .fuelLevel(50)
            .build();

        driver = Driver.builder()
            .id("d1")
            .name("Jean Dupont")
            .email("jean@example.com")
            .phone("0123456789")
            .status(DriverStatus.DISPONIBLE)
            .skills(Set.of("CAMION", "EXCAVATRICE"))
            .build();
    }

    // TEST 1: Conducteur non habilité
    @Test
    void testCreateMissionWithUnqualifiedDriver() {
        Driver unqualifiedDriver = Driver.builder()
            .id("d1")
            .name("Jean Dupont")
            .email("jean@example.com")
            .phone("0123456789")
            .status(DriverStatus.DISPONIBLE)
            .skills(Set.of("EXCAVATRICE"))
            .build();

        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));
        when(driverRepository.findById("d1")).thenReturn(Optional.of(unqualifiedDriver));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            missionService.createMission("v1", "d1", startDate, endDate, "Site A", "Client X", 1000, "admin");
        });

        assertEquals("DRIVER_NOT_QUALIFIED", exception.getCode());
        assertEquals(400, exception.getHttpStatus());
    }

    // TEST 2: Conducteur habilité
    @Test
    void testCreateMissionWithQualifiedDriver() {
        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));
        when(driverRepository.findById("d1")).thenReturn(Optional.of(driver));
        when(missionRepository.findOverlappingVehicleMissions(anyString(), any(), any())).thenReturn(List.of());
        when(missionRepository.findOverlappingDriverMissions(anyString(), any(), any())).thenReturn(List.of());
        when(missionRepository.save(any())).thenAnswer(invocation -> {
            Mission m = invocation.getArgument(0);
            m.setId("ms1");
            return m;
        });

        Mission mission = missionService.createMission("v1", "d1", startDate, endDate, "Site A", "Client X", 1000, "admin");

        assertNotNull(mission);
        assertEquals(MissionStatus.AFFECTEE, mission.getStatus());
        verify(vehicleRepository, times(1)).save(any());
        verify(driverRepository, times(1)).save(any());
        verify(auditService, times(1)).logEvent(any(), anyString(), any());
    }

    // TEST 3: Conflit véhicule
    @Test
    void testCreateMissionWithVehicleConflict() {
        Mission conflictingMission = Mission.builder()
            .id("ms-conflict")
            .code("MS-0001")
            .vehicle(vehicle)
            .driver(driver)
            .startDate(LocalDate.of(2026, 8, 29))
            .endDate(LocalDate.of(2026, 8, 31))
            .status(MissionStatus.AFFECTEE)
            .build();

        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));
        when(driverRepository.findById("d1")).thenReturn(Optional.of(driver));
        when(missionRepository.findOverlappingVehicleMissions("v1", startDate, endDate))
            .thenReturn(List.of(conflictingMission));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            missionService.createMission("v1", "d1", startDate, endDate, "Site A", "Client X", 1000, "admin");
        });

        assertEquals("VEHICLE_CONFLICT", exception.getCode());
        assertEquals(409, exception.getHttpStatus());
    }

    // TEST 4: Conflit conducteur
    @Test
    void testCreateMissionWithDriverConflict() {
        Mission conflictingMission = Mission.builder()
            .id("ms-conflict")
            .code("MS-0001")
            .vehicle(vehicle)
            .driver(driver)
            .startDate(LocalDate.of(2026, 8, 29))
            .endDate(LocalDate.of(2026, 8, 31))
            .status(MissionStatus.AFFECTEE)
            .build();

        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));
        when(driverRepository.findById("d1")).thenReturn(Optional.of(driver));
        when(missionRepository.findOverlappingVehicleMissions(anyString(), any(), any())).thenReturn(List.of());
        when(missionRepository.findOverlappingDriverMissions("d1", startDate, endDate))
            .thenReturn(List.of(conflictingMission));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            missionService.createMission("v1", "d1", startDate, endDate, "Site A", "Client X", 1000, "admin");
        });

        assertEquals("DRIVER_CONFLICT", exception.getCode());
        assertEquals(409, exception.getHttpStatus());
    }

    // TEST 5: Création valide sans conflits
    @Test
    void testCreateMissionWithoutConflicts() {
        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));
        when(driverRepository.findById("d1")).thenReturn(Optional.of(driver));
        when(missionRepository.findOverlappingVehicleMissions(anyString(), any(), any())).thenReturn(List.of());
        when(missionRepository.findOverlappingDriverMissions(anyString(), any(), any())).thenReturn(List.of());
        when(missionRepository.save(any())).thenAnswer(invocation -> {
            Mission m = invocation.getArgument(0);
            m.setId("ms2");
            return m;
        });

        Mission mission = missionService.createMission("v1", "d1", startDate, endDate, "Site B", "Client Y", 2000, "admin");

        assertNotNull(mission);
        assertEquals(MissionStatus.AFFECTEE, mission.getStatus());
        assertEquals(VehicleStatus.RESERVE, vehicle.getStatus());
        assertEquals(DriverStatus.RESERVE, driver.getStatus());
    }

    // TEST 6: Démarrage d'une mission
    @Test
    void testStartMissionSuccess() {
        Mission mission = Mission.builder()
            .id("ms1")
            .code("MS-0001")
            .vehicle(vehicle)
            .driver(driver)
            .status(MissionStatus.AFFECTEE)
            .startDate(startDate)
            .endDate(endDate)
            .build();

        when(missionRepository.findById("ms1")).thenReturn(Optional.of(mission));
        when(missionRepository.save(any())).thenReturn(mission);

        Mission started = missionService.startMission("ms1", 1005, 102, 48, "driver-id");

        assertEquals(MissionStatus.EN_COURS, started.getStatus());
        assertEquals(1005, started.getDepartureKm());
        assertEquals(102, started.getDepartureEngineHours());
        assertEquals(48, started.getDepartureFuel());
    }

    // TEST 7: Démarrage invalide (status incorrect)
    @Test
    void testStartMissionWithInvalidStatus() {
        Mission mission = Mission.builder()
            .id("ms1")
            .code("MS-0001")
            .vehicle(vehicle)
            .driver(driver)
            .status(MissionStatus.EN_COURS)
            .startDate(startDate)
            .endDate(endDate)
            .build();

        when(missionRepository.findById("ms1")).thenReturn(Optional.of(mission));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            missionService.startMission("ms1", 1005, 102, 48, "driver-id");
        });

        assertEquals("MISSION_NOT_AFFECTEE", exception.getCode());
    }

    // TEST 8: Retour d'une mission
    @Test
    void testReturnMissionSuccess() {
        Mission mission = Mission.builder()
            .id("ms1")
            .code("MS-0001")
            .vehicle(vehicle)
            .driver(driver)
            .status(MissionStatus.EN_COURS)
            .departureKm(1005)
            .departureEngineHours(102)
            .departureFuel(48)
            .startDate(startDate)
            .endDate(endDate)
            .build();

        when(missionRepository.findById("ms1")).thenReturn(Optional.of(mission));
        when(missionRepository.save(any())).thenReturn(mission);

        Mission returned = missionService.returnMission("ms1", 1050, 110, 40, "driver-id");

        assertEquals(MissionStatus.CONTROLE, returned.getStatus());
        assertEquals(1050, returned.getReturnKm());
        assertEquals(110, returned.getReturnEngineHours());
        assertEquals(40, returned.getReturnFuel());
    }

    // TEST 9: Validation du retour
    @Test
    void testValidateReturnSuccess() {
        Mission mission = Mission.builder()
            .id("ms1")
            .code("MS-0001")
            .vehicle(vehicle)
            .driver(driver)
            .status(MissionStatus.CONTROLE)
            .startDate(startDate)
            .endDate(endDate)
            .build();

        when(missionRepository.findById("ms1")).thenReturn(Optional.of(mission));
        when(missionRepository.save(any())).thenReturn(mission);

        Mission validated = missionService.validateReturn("ms1", "gestionnaire-id");

        assertEquals(MissionStatus.CLOTUREE, validated.getStatus());
        assertEquals(VehicleStatus.DISPONIBLE, vehicle.getStatus());
        assertEquals(DriverStatus.DISPONIBLE, driver.getStatus());
    }

    // TEST 10: Envoi en maintenance
    @Test
    void testSendToMaintenanceSuccess() {
        Mission mission = Mission.builder()
            .id("ms1")
            .code("MS-0001")
            .vehicle(vehicle)
            .driver(driver)
            .status(MissionStatus.CONTROLE)
            .startDate(startDate)
            .endDate(endDate)
            .build();

        when(missionRepository.findById("ms1")).thenReturn(Optional.of(mission));
        when(missionRepository.save(any())).thenReturn(mission);

        Mission maintenance = missionService.sendToMaintenance("ms1", "gestionnaire-id");

        assertEquals(MissionStatus.CLOTUREE, maintenance.getStatus());
        assertEquals(VehicleStatus.MAINTENANCE, vehicle.getStatus());
        assertEquals(DriverStatus.DISPONIBLE, driver.getStatus());
    }
}
