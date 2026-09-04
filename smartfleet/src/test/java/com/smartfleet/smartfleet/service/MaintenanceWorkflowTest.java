package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.InspectionRepository;
import com.smartfleet.smartfleet.repository.MaintenanceRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Enchaînement contrôle → immobilisation → réparation → remise en service.
 *
 * C'est le chaînon qui manquait au cycle de vie du véhicule. Ce qui se joue ici
 * n'est pas de l'enregistrement : c'est la garantie qu'un engin déclaré
 * dangereux ne puisse pas repartir en mission.
 */
class MaintenanceWorkflowTest {

    private InspectionRepository inspections;
    private MaintenanceRepository maintenances;
    private VehicleRepository vehicles;
    private MissionRepository missions;

    private InspectionService inspectionService;
    private MaintenanceService maintenanceService;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        inspections = Mockito.mock(InspectionRepository.class);
        maintenances = Mockito.mock(MaintenanceRepository.class);
        vehicles = Mockito.mock(VehicleRepository.class);
        missions = Mockito.mock(MissionRepository.class);

        vehicle = new Vehicle();
        vehicle.setId("v1");
        vehicle.setCode("ENG-001");
        vehicle.setStatus(VehicleStatus.DISPONIBLE);
        vehicle.setCondition(VehicleCondition.BON);
        vehicle.setCurrentKm(52340);

        when(vehicles.findById("v1")).thenReturn(Optional.of(vehicle));
        when(vehicles.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(inspections.save(any())).thenAnswer(inv -> {
            Inspection i = inv.getArgument(0);
            if (i.getId() == null) i.setId("insp-1");
            return i;
        });
        when(maintenances.save(any())).thenAnswer(inv -> {
            Maintenance m = inv.getArgument(0);
            if (m.getId() == null) m.setId("mnt-1");
            return m;
        });
        when(maintenances.findByVehicle_IdAndStatusIn(any(), any())).thenReturn(List.of());

        inspectionService = new InspectionService(inspections, maintenances, vehicles, missions);
        maintenanceService = new MaintenanceService(maintenances, vehicles);
    }

    private Inspection inspect(boolean tyres, boolean brakes, boolean lights, boolean body,
                               InspectionResult declared) {
        return inspectionService.record("v1", null, InspectionType.APRES_MISSION,
            tyres, brakes, lights, body, declared, null, 52400, null);
    }

    @Nested
    @DisplayName("Verdict du contrôle")
    class Verdict {

        @Test
        @DisplayName("Tous les points conformes donnent un contrôle sans suite")
        void toutConforme() {
            var i = inspect(true, true, true, true, null);

            assertEquals(InspectionResult.OK, i.getResult());
            assertEquals(VehicleStatus.DISPONIBLE, vehicle.getStatus());
            verify(maintenances, never()).save(any());
        }

        @Test
        @DisplayName("Un défaut de freins est bloquant, même sans verdict déclaré")
        void freinsToujoursBloquants() {
            // Un engin qui ne s'arrête pas n'est pas un engin qu'on surveille.
            var i = inspect(true, false, true, true, null);

            assertEquals(InspectionResult.CRITIQUE, i.getResult());
        }

        @Test
        @DisplayName("Un défaut secondaire appelle une surveillance, pas une immobilisation")
        void defautSecondaire() {
            var i = inspect(true, true, false, true, null);

            assertEquals(InspectionResult.ATTENTION, i.getResult());
            assertEquals(VehicleStatus.DISPONIBLE, vehicle.getStatus());
        }

        @Test
        @DisplayName("Le jugement du contrôleur prime sur le décompte des cases")
        void verdictDeclarePrime() {
            // Une carrosserie enfoncée peut être bloquante sur un engin donné.
            var i = inspect(true, true, true, false, InspectionResult.CRITIQUE);

            assertEquals(InspectionResult.CRITIQUE, i.getResult());
            assertEquals(VehicleStatus.MAINTENANCE, vehicle.getStatus());
        }
    }

    @Nested
    @DisplayName("Immobilisation")
    class Immobilisation {

        @Test
        @DisplayName("Un contrôle critique retire le véhicule de l'exploitation")
        void retireDeLExploitation() {
            inspect(false, false, true, true, null);

            assertEquals(VehicleStatus.MAINTENANCE, vehicle.getStatus());
            assertEquals(VehicleCondition.MAUVAIS, vehicle.getCondition());
        }

        @Test
        @DisplayName("L'intervention est ouverte dans le même mouvement")
        void ouvreLIntervention() {
            // Sans elle, l'engin resterait immobilisé sans que personne ne suive
            // sa remise en état.
            inspect(false, false, true, true, null);

            var captor = ArgumentCaptor.forClass(Maintenance.class);
            verify(maintenances).save(captor.capture());

            var m = captor.getValue();
            assertEquals(MaintenanceStatus.PLANIFIEE, m.getStatus());
            assertEquals(MaintenanceType.CORRECTIVE, m.getType());
            assertEquals("insp-1", m.getInspection().getId());
        }

        @Test
        @DisplayName("La description nomme les points en défaut")
        void descriptionUtile() {
            inspect(false, false, true, true, null);

            var captor = ArgumentCaptor.forClass(Maintenance.class);
            verify(maintenances).save(captor.capture());

            // L'atelier doit savoir quoi regarder.
            String description = captor.getValue().getDescription();
            assertTrue(description.contains("pneus"), description);
            assertTrue(description.contains("freins"), description);
            assertFalse(description.contains("éclairage"), description);
        }
    }

    @Nested
    @DisplayName("Cycle de l'intervention")
    class Cycle {

        private Maintenance planned() {
            Maintenance m = Maintenance.builder()
                .id("mnt-1")
                .vehicle(vehicle)
                .type(MaintenanceType.PREVENTIVE)
                .status(MaintenanceStatus.PLANIFIEE)
                .description("Révision des 500 heures")
                .build();
            when(maintenances.findById("mnt-1")).thenReturn(Optional.of(m));
            return m;
        }

        @Test
        @DisplayName("Planifier une intervention immobilise un engin disponible")
        void planificationImmobilise() {
            maintenanceService.schedule("v1", MaintenanceType.PREVENTIVE,
                "Révision des 500 heures", LocalDate.now().plusDays(3), "Atelier central", null);

            assertEquals(VehicleStatus.MAINTENANCE, vehicle.getStatus());
        }

        @Test
        @DisplayName("Une intervention planifiée n'interrompt pas une mission en cours")
        void nInterrompPasUneMission() {
            // L'engin passera à l'atelier à son retour.
            vehicle.setStatus(VehicleStatus.EN_MISSION);

            maintenanceService.schedule("v1", MaintenanceType.PREVENTIVE,
                "Révision", LocalDate.now().plusDays(3), null, null);

            assertEquals(VehicleStatus.EN_MISSION, vehicle.getStatus());
        }

        @Test
        @DisplayName("Une description vide est refusée")
        void descriptionObligatoire() {
            var e = assertThrows(BusinessException.class, () ->
                maintenanceService.schedule("v1", MaintenanceType.PREVENTIVE, "  ", null, null, null));
            assertEquals("DESCRIPTION_REQUIRED", e.getCode());
        }

        @Test
        @DisplayName("Clôturer remet le véhicule en service")
        void clotureRemetEnService() {
            planned();
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicle.setCondition(VehicleCondition.MAUVAIS);

            maintenanceService.complete("mnt-1", 420000, "Atelier central", "Freins remplacés", null);

            assertEquals(VehicleStatus.DISPONIBLE, vehicle.getStatus());
            assertEquals(VehicleCondition.BON, vehicle.getCondition());
        }

        @Test
        @DisplayName("Le coût est exigé à la clôture")
        void coutObligatoire() {
            planned();

            // Une intervention close sans coût disparaît des indicateurs de
            // flotte sans qu'on s'en aperçoive.
            var e = assertThrows(BusinessException.class, () ->
                maintenanceService.complete("mnt-1", null, null, null, null));
            assertEquals("COST_REQUIRED", e.getCode());
        }

        @Test
        @DisplayName("Un coût négatif est refusé")
        void coutNegatif() {
            planned();
            assertThrows(BusinessException.class, () ->
                maintenanceService.complete("mnt-1", -100, null, null, null));
        }

        @Test
        @DisplayName("Le véhicule reste à l'atelier si une autre intervention est ouverte")
        void resteImmobiliseSiAutreOuverte() {
            planned();
            vehicle.setStatus(VehicleStatus.MAINTENANCE);

            Maintenance autre = Maintenance.builder()
                .id("mnt-2").vehicle(vehicle)
                .status(MaintenanceStatus.EN_COURS)
                .description("Carrosserie")
                .build();
            when(maintenances.findByVehicle_IdAndStatusIn(any(), any())).thenReturn(List.of(autre));

            maintenanceService.complete("mnt-1", 120000, null, null, null);

            // Libérer l'engin après la première réparation le rendrait affectable
            // alors qu'il est encore à l'atelier.
            assertEquals(VehicleStatus.MAINTENANCE, vehicle.getStatus());
        }

        @Test
        @DisplayName("L'état constaté par l'atelier est retenu")
        void etatConstateRetenu() {
            planned();
            vehicle.setStatus(VehicleStatus.MAINTENANCE);

            maintenanceService.complete("mnt-1", 90000, null, "Réparation provisoire",
                VehicleCondition.MOYEN);

            assertEquals(VehicleCondition.MOYEN, vehicle.getCondition());
        }

        @Test
        @DisplayName("Une intervention déjà terminée ne se clôture pas deux fois")
        void pasDeDoubleCloture() {
            Maintenance m = planned();
            m.setStatus(MaintenanceStatus.TERMINEE);

            var e = assertThrows(BusinessException.class, () ->
                maintenanceService.complete("mnt-1", 1000, null, null, null));
            assertEquals("ALREADY_COMPLETED", e.getCode());
        }

        @Test
        @DisplayName("Seule une intervention planifiée peut être démarrée")
        void demarrageDepuisPlanifiee() {
            Maintenance m = planned();
            m.setStatus(MaintenanceStatus.EN_COURS);

            assertThrows(BusinessException.class, () -> maintenanceService.start("mnt-1"));
        }

        @Test
        @DisplayName("Annuler libère le véhicule sans effacer la trace")
        void annulationConserveLaTrace() {
            Maintenance m = planned();
            vehicle.setStatus(VehicleStatus.MAINTENANCE);

            maintenanceService.cancel("mnt-1");

            assertEquals(MaintenanceStatus.ANNULEE, m.getStatus());
            assertEquals(VehicleStatus.DISPONIBLE, vehicle.getStatus());
        }

        @Test
        @DisplayName("Une intervention terminée ne peut plus être annulée")
        void pasDAnnulationApresCloture() {
            Maintenance m = planned();
            m.setStatus(MaintenanceStatus.TERMINEE);

            assertThrows(BusinessException.class, () -> maintenanceService.cancel("mnt-1"));
        }
    }

    @Test
    @DisplayName("Un contrôle sur un véhicule inconnu est refusé")
    void vehiculeInconnu() {
        when(vehicles.findById("absent")).thenReturn(Optional.empty());

        var e = assertThrows(BusinessException.class, () ->
            inspectionService.record("absent", null, InspectionType.QUOTIDIEN,
                true, true, true, true, null, null, null, null));
        assertEquals("VEHICLE_NOT_FOUND", e.getCode());
    }
}
