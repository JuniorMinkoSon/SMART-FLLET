package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.exception.ConflictException;
import com.smartfleet.smartfleet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MissionService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final MissionRepository missionRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /* ================================================================== */
    /*  ANTI-OVERBOOKING - le backend est la seule source de verite.      */
    /* ================================================================== */

    /**
     * Refuse toute affectation qui chevauche une mission active du meme engin
     * ou du meme conducteur. Appele a la creation ET a la reaffectation, donc
     * impossible a contourner meme par un appel HTTP direct.
     */
    public void assertNoOverlap(String vehicleId, String driverId,
                                LocalDateTime start, LocalDateTime end,
                                String excludedMissionId) {
        if (start == null || end == null) {
            throw new BusinessException("INVALID_PERIOD", "Dates de mission obligatoires", 400);
        }
        if (end.isBefore(start)) {
            throw new BusinessException("INVALID_PERIOD",
                "La date de fin doit etre posterieure a la date de debut", 400);
        }

        List<Mission> vehicleOverlaps =
            missionRepository.findVehicleOverlaps(vehicleId, start, end, excludedMissionId);
        if (!vehicleOverlaps.isEmpty()) {
            String label = vehicleRepository.findById(vehicleId)
                .map(Vehicle::getCode).orElse(vehicleId);
            throw new ConflictException(
                "VEHICLE_OVERBOOKED",
                "L'engin " + label + " est deja affecte sur cette periode.",
                vehicleOverlaps.stream().map(this::toConflictDetail).toList(),
                findAlternatives(vehicleId, start, end));
        }

        List<Mission> driverOverlaps =
            missionRepository.findDriverOverlaps(driverId, start, end, excludedMissionId);
        if (!driverOverlaps.isEmpty()) {
            String label = driverRepository.findById(driverId)
                .map(Driver::getName).orElse(driverId);
            throw new ConflictException(
                "DRIVER_OVERBOOKED",
                "Le conducteur " + label + " est deja affecte sur cette periode.",
                driverOverlaps.stream().map(this::toConflictDetail).toList(),
                List.of());
        }
    }

    /** Engins du meme type reellement libres sur la periode (suggestions). */
    @Transactional(readOnly = true)
    public List<ConflictException.AlternativeVehicle> findAlternatives(String excludedVehicleId,
                                                                       LocalDateTime start,
                                                                       LocalDateTime end) {
        String wantedType = vehicleRepository.findById(excludedVehicleId)
            .map(Vehicle::getType).orElse(null);
        List<String> busy = missionRepository.findBusyVehicleIds(start, end);

        return vehicleRepository.findAll().stream()
            .filter(v -> !v.getId().equals(excludedVehicleId))
            .filter(v -> !busy.contains(v.getId()))
            .filter(v -> v.getStatus() == VehicleStatus.DISPONIBLE)
            .filter(v -> wantedType == null || wantedType.equals(v.getType()))
            .map(v -> new ConflictException.AlternativeVehicle(
                v.getId(), v.getCode(), v.getType(), v.getStatus().name()))
            .toList();
    }

    @Transactional(readOnly = true)
    public boolean isVehicleAvailable(String vehicleId, LocalDateTime start, LocalDateTime end) {
        return missionRepository.findVehicleOverlaps(vehicleId, start, end, null).isEmpty();
    }

    /** Engins affectables sur une periode donnee (alimente le wizard). */
    @Transactional(readOnly = true)
    public List<Vehicle> getAvailableVehicles(LocalDateTime start, LocalDateTime end) {
        List<String> busy = missionRepository.findBusyVehicleIds(start, end);
        return vehicleRepository.findAll().stream()
            .filter(v -> !busy.contains(v.getId()))
            .filter(v -> v.getStatus() != VehicleStatus.MAINTENANCE
                      && v.getStatus() != VehicleStatus.HORS_SERVICE)
            .toList();
    }

    /** Conducteurs affectables sur une periode donnee. */
    @Transactional(readOnly = true)
    public List<Driver> getAvailableDrivers(LocalDateTime start, LocalDateTime end) {
        return driverRepository.findAll().stream()
            .filter(d -> missionRepository.findDriverOverlaps(d.getId(), start, end, null).isEmpty())
            .filter(d -> d.getStatus() != DriverStatus.INDISPONIBLE)
            .toList();
    }

    private ConflictException.ConflictDetail toConflictDetail(Mission m) {
        return new ConflictException.ConflictDetail(
            m.getId(), m.getCode(), m.getSite(),
            m.getStartDate().format(ISO), m.getEndDate().format(ISO),
            m.getStatus().name());
    }

    /* ================================================================== */
    /*  Cycle de vie de la mission                                        */
    /* ================================================================== */

    public Mission createMission(String vehicleId, String driverId,
                                 LocalDateTime startDate, LocalDateTime endDate,
                                 String site, String client, Long budget, String actorId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
            .orElseThrow(() -> new BusinessException("VEHICLE_NOT_FOUND", "Engin non trouve", 404));
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new BusinessException("DRIVER_NOT_FOUND", "Conducteur non trouve", 404));

        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE
            || vehicle.getStatus() == VehicleStatus.HORS_SERVICE) {
            throw new BusinessException("VEHICLE_UNAVAILABLE",
                "L'engin " + vehicle.getCode() + " est indisponible (" + vehicle.getStatus() + ")", 409);
        }

        assertNoOverlap(vehicleId, driverId, startDate, endDate, null);

        Mission mission = Mission.builder()
            .code(nextCode())
            .vehicle(vehicle)
            .driver(driver)
            .startDate(startDate)
            .endDate(endDate)
            .site(site)
            .client(client)
            .budget(budget)
            .status(MissionStatus.AFFECTEE)
            .build();

        Mission saved = missionRepository.save(mission);

        vehicle.setStatus(VehicleStatus.RESERVE);
        vehicleRepository.save(vehicle);
        driver.setStatus(DriverStatus.RESERVE);
        driverRepository.save(driver);

        auditService.log(actorId, AuditEventType.MISSION_CREATED, "Mission", saved.getId(),
            "Mission " + saved.getCode() + " creee sur " + site);
        return saved;
    }

    private String nextCode() {
        return "MS-" + String.format("%04d", missionRepository.count() + 1);
    }

    @Transactional(readOnly = true)
    public Optional<Mission> getMissionById(String id) {
        return missionRepository.findById(id);
    }

    private Mission require(String id) {
        return missionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvee", 404));
    }

    @Transactional(readOnly = true)
    public List<Mission> getAllMissions() {
        return missionRepository.findAll();
    }

    /**
     * Missions du conducteur connecte. Le principal de securite porte
     * l'identifiant utilisateur, pas l'email : on resout donc le compte puis
     * le conducteur correspondant (par relation user, sinon par email).
     */
    @Transactional(readOnly = true)
    public List<Mission> getDriverMissions(String userId) {
        var user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();

        String email = user.getEmail();
        return missionRepository.findAll().stream()
            .filter(m -> {
                Driver d = m.getDriver();
                if (d == null) return false;
                if (d.getUser() != null && userId.equals(d.getUser().getId())) return true;
                return d.getEmail() != null && d.getEmail().equalsIgnoreCase(email);
            })
            .toList();
    }

    public Mission assignDriver(String missionId, String driverId, String actorId) {
        Mission mission = require(missionId);
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new BusinessException("DRIVER_NOT_FOUND", "Conducteur non trouve", 404));

        assertNoOverlap(mission.getVehicle().getId(), driverId,
            mission.getStartDate(), mission.getEndDate(), missionId);

        mission.setDriver(driver);
        mission.setStatus(MissionStatus.AFFECTEE);
        driver.setStatus(DriverStatus.RESERVE);
        driverRepository.save(driver);

        auditService.log(actorId, AuditEventType.MISSION_ASSIGNED, "Mission", missionId,
            "Conducteur " + driver.getName() + " affecte");
        return missionRepository.save(mission);
    }

    /** Depart - saisi par le conducteur. */
    public Mission startMission(String id, Integer km, Integer engineHours, Integer fuel, String actorId) {
        Mission mission = require(id);
        if (mission.getStatus() != MissionStatus.AFFECTEE) {
            throw new BusinessException("INVALID_STATE",
                "Seule une mission affectee peut demarrer (etat actuel : " + mission.getStatus() + ")", 409);
        }
        mission.setStatus(MissionStatus.EN_COURS);
        mission.setDepartureKm(km);
        mission.setDepartureEngineHours(engineHours);
        mission.setDepartureFuel(fuel);

        Vehicle v = mission.getVehicle();
        v.setStatus(VehicleStatus.EN_MISSION);
        if (km != null) v.setCurrentKm(km);
        if (engineHours != null) v.setEngineHours(engineHours);
        if (fuel != null) v.setFuelLevel(fuel);
        vehicleRepository.save(v);

        Driver d = mission.getDriver();
        d.setStatus(DriverStatus.EN_MISSION);
        driverRepository.save(d);

        auditService.log(actorId, AuditEventType.MISSION_STARTED, "Mission", id,
            "Depart enregistre (" + km + " km)");
        return missionRepository.save(mission);
    }

    /** Retour - saisi par le conducteur, passe la mission en controle. */
    public Mission endMission(String id, Integer km, Integer engineHours, Integer fuel, String actorId) {
        Mission mission = require(id);
        if (mission.getStatus() != MissionStatus.EN_COURS) {
            throw new BusinessException("INVALID_STATE",
                "Seule une mission en cours peut etre retournee (etat actuel : " + mission.getStatus() + ")", 409);
        }
        if (km != null && mission.getDepartureKm() != null && km < mission.getDepartureKm()) {
            throw new BusinessException("INVALID_COUNTER",
                "Le kilometrage de retour ne peut pas etre inferieur a celui du depart", 400);
        }
        mission.setStatus(MissionStatus.CONTROLE);
        mission.setArrivalKm(km);
        mission.setArrivalEngineHours(engineHours);
        mission.setArrivalFuel(fuel);

        Vehicle v = mission.getVehicle();
        v.setStatus(VehicleStatus.CONTROLE);
        if (km != null) v.setCurrentKm(km);
        if (engineHours != null) v.setEngineHours(engineHours);
        if (fuel != null) v.setFuelLevel(fuel);
        vehicleRepository.save(v);

        auditService.log(actorId, AuditEventType.MISSION_RETURNED, "Mission", id,
            "Retour enregistre (" + km + " km)");
        return missionRepository.save(mission);
    }

    /** Validation du retour par ADMIN/GESTIONNAIRE : cloture ou maintenance. */
    public Mission validateReturn(String id, boolean conform, String actorId) {
        Mission mission = require(id);
        if (mission.getStatus() != MissionStatus.CONTROLE) {
            throw new BusinessException("INVALID_STATE",
                "Seule une mission en controle peut etre validee (etat actuel : " + mission.getStatus() + ")", 409);
        }
        mission.setStatus(MissionStatus.CLOTUREE);

        Vehicle v = mission.getVehicle();
        v.setStatus(conform ? VehicleStatus.DISPONIBLE : VehicleStatus.MAINTENANCE);
        vehicleRepository.save(v);

        Driver d = mission.getDriver();
        d.setStatus(DriverStatus.DISPONIBLE);
        driverRepository.save(d);

        auditService.log(actorId,
            conform ? AuditEventType.MISSION_VALIDATED : AuditEventType.MISSION_SENT_TO_MAINTENANCE,
            "Mission", id,
            conform ? "Retour valide, mission cloturee" : "Engin envoye en maintenance");
        return missionRepository.save(mission);
    }
}
