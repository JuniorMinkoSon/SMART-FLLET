package ci.volta.backend.service;

import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.QuoteRequest;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.Report;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.QuoteRequestRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.ReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class VoltaService {

    public static final List<ChecklistItem> CHECKLIST_TEMPLATE = List.of(
            new ChecklistItem("MÉCANIQUE", "Moteur", null, ""),
            new ChecklistItem("MÉCANIQUE", "Transmission", null, ""),
            new ChecklistItem("MÉCANIQUE", "Hydraulique", null, ""),
            new ChecklistItem("MÉCANIQUE", "Freinage", null, ""),
            new ChecklistItem("MÉCANIQUE", "Direction", null, ""),
            new ChecklistItem("MÉCANIQUE", "Pneus / chenilles", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Godet", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Bras", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Accessoires", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Équipements spécifiques", null, ""),
            new ChecklistItem("SÉCURITÉ", "Dispositifs de sécurité", null, ""),
            new ChecklistItem("SÉCURITÉ", "Éclairage", null, ""),
            new ChecklistItem("SÉCURITÉ", "Signalisation", null, ""),
            new ChecklistItem("SÉCURITÉ", "Équipements obligatoires", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Carrosserie", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Corrosion", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Usure", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Fonctionnement général", null, ""));

    private final EquipmentRepository equipmentRepository;
    private final InspectionRepository inspectionRepository;
    private final ReportRepository reportRepository;
    private final RentalRequestRepository rentalRequestRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final NotificationRepository notificationRepository;

    public VoltaService(
            EquipmentRepository equipmentRepository,
            InspectionRepository inspectionRepository,
            ReportRepository reportRepository,
            RentalRequestRepository rentalRequestRepository,
            QuoteRequestRepository quoteRequestRepository,
            NotificationRepository notificationRepository) {
        this.equipmentRepository = equipmentRepository;
        this.inspectionRepository = inspectionRepository;
        this.reportRepository = reportRepository;
        this.rentalRequestRepository = rentalRequestRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.notificationRepository = notificationRepository;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    private static String newId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void notify(String role, String message) {
        notificationRepository.save(new Notification(newId("n"), role, message, today(), false));
    }

    private Equipment getEquipment(String id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found: " + id));
    }

    private Inspection getInspection(String id) {
        return inspectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inspection not found: " + id));
    }

    public Equipment addEquipment(Equipment equipment) {
        equipment.id = newId("eq");
        equipment.status = "DRAFT";
        equipment.level = null;
        equipment.createdAt = today();
        return equipmentRepository.save(equipment);
    }

    public Equipment submitEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "SUBMITTED";
        notify("ADMIN", eq.name + " soumis pour vérification");
        return equipmentRepository.save(eq);
    }

    public Inspection assignInspection(String equipmentId, String technicalTeamId) {
        Equipment eq = getEquipment(equipmentId);
        Inspection inspection = new Inspection();
        inspection.id = newId("insp");
        inspection.equipmentId = equipmentId;
        inspection.technicalTeamId = technicalTeamId;
        inspection.assignedAt = today();
        inspection.status = "ASSIGNED";
        inspection.checklist = CHECKLIST_TEMPLATE.stream()
                .map(c -> new ChecklistItem(c.section, c.label, c.result, c.observation))
                .toList();
        inspection = inspectionRepository.save(inspection);
        eq.status = "PENDING_INSPECTION";
        equipmentRepository.save(eq);
        notify("TECHNICAL", "Nouvelle mission assignée : " + eq.name);
        notify("SUPPLIER", eq.name + " est en attente d'inspection");
        return inspection;
    }

    public Inspection startInspection(String inspectionId) {
        Inspection inspection = getInspection(inspectionId);
        inspection.status = "IN_PROGRESS";
        inspection = inspectionRepository.save(inspection);
        Equipment eq = getEquipment(inspection.equipmentId);
        eq.status = "INSPECTION_IN_PROGRESS";
        equipmentRepository.save(eq);
        return inspection;
    }

    public Inspection updateChecklist(String inspectionId, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        inspection.checklist = checklist;
        return inspectionRepository.save(inspection);
    }

    public Report submitReport(String inspectionId, String summary, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        Report report = new Report();
        report.id = newId("rep");
        report.inspectionId = inspectionId;
        report.equipmentId = inspection.equipmentId;
        report.submittedAt = today();
        report.summary = summary;
        report.checklist = checklist;
        report = reportRepository.save(report);
        inspection.status = "DONE";
        inspection.checklist = checklist;
        inspectionRepository.save(inspection);
        Equipment eq = getEquipment(inspection.equipmentId);
        eq.status = "PENDING_ADMIN_REVIEW";
        equipmentRepository.save(eq);
        notify("ADMIN", "Rapport d'inspection transmis pour " + eq.name);
        return report;
    }

    public Equipment rejectEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "REJECTED";
        notify("SUPPLIER", eq.name + " a été refusé après vérification");
        return equipmentRepository.save(eq);
    }

    public Equipment referenceEquipment(String equipmentId, String level) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "REFERENCED";
        eq.level = level;
        notify("SUPPLIER", eq.name + " a été référencé " + level);
        return equipmentRepository.save(eq);
    }

    public Equipment publishEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "PUBLISHED";
        notify("SUPPLIER", eq.name + " est publié sur le catalogue");
        return equipmentRepository.save(eq);
    }

    public Equipment unpublishEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "UNPUBLISHED";
        notify("SUPPLIER", eq.name + " a été dépublié du catalogue");
        return equipmentRepository.save(eq);
    }

    public QuoteRequest createQuoteRequest(QuoteRequest request) {
        Equipment eq = getEquipment(request.equipmentId);
        long num = 1 + quoteRequestRepository.count();
        if (request.id == null || request.id.isBlank()) {
            request.id = newId("dv");
        }
        if (request.reference == null || request.reference.isBlank()) {
            request.reference = String.format("DV-2026-%03d", num);
        }
        request.supplierId = eq.supplierId;
        request.status = "NOUVELLE";
        request.createdAt = today();
        request = quoteRequestRepository.save(request);
        notify("SUPPLIER", "Nouvelle demande de devis " + request.reference + " — " + eq.name);
        notify("ADMIN", "Demande de devis " + request.reference + " de " + request.clientName);
        return request;
    }

    public QuoteRequest updateQuoteRequestStatus(String quoteRequestId, String status) {
        QuoteRequest request = quoteRequestRepository.findById(quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote request not found: " + quoteRequestId));
        request.status = status;
        return quoteRequestRepository.save(request);
    }

    public RentalRequest createRentalRequest(RentalRequest request) {
        Equipment eq = getEquipment(request.equipmentId);
        long num = 124 + rentalRequestRepository.count();
        request.id = newId("req");
        request.reference = String.format("VOL-2026-%05d", num);
        request.supplierId = eq.supplierId;
        request.status = "PENDING";
        request.createdAt = today();
        request = rentalRequestRepository.save(request);
        notify("ADMIN", "Nouvelle demande de location " + request.reference + " — " + eq.name);
        notify("SUPPLIER", "Nouvelle demande de location " + request.reference + " — " + eq.name);
        return request;
    }
}
