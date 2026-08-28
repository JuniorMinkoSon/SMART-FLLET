package ci.volta.backend.config;

import ci.volta.backend.model.Category;
import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.DocumentInfo;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.QuoteRequest;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.CategoryRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.QuoteRequestRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.VoltaService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    private static final String IMG_EXCAVATOR = unsplash("1580901368919-7738efb0f87e");
    private static final String IMG_EXCAVATOR_QUARRY = unsplash("1517089596392-fb9a9033e05b");
    private static final String IMG_MINING_MACHINES = unsplash("1523848309072-c199db53f137");
    private static final String IMG_TRUCK = unsplash("1616432043562-3671ea2e5242");
    private static final String IMG_TRUCK_ROAD = unsplash("1519003722824-194d4455a60c");
    private static final String IMG_CRANES = unsplash("1429497419816-9ca5cfb4571a");

    private static String unsplash(String id) {
        return "https://images.unsplash.com/photo-" + id + "?w=640&q=70";
    }

    private static UserAccount user(String id, String name, String role, String company, String email, String phone, String city) {
        UserAccount u = new UserAccount();
        u.id = id;
        u.name = name;
        u.role = role;
        u.company = company;
        u.email = email;
        u.phone = phone;
        u.city = city;
        return u;
    }

    private static Category category(String id, String name, String icon) {
        Category c = new Category();
        c.id = id;
        c.name = name;
        c.icon = icon;
        return c;
    }

    private static List<ChecklistItem> checklist(String result) {
        return VoltaService.CHECKLIST_TEMPLATE.stream()
                .map(c -> new ChecklistItem(c.section, c.label, result, c.observation))
                .toList();
    }

    @Bean
    CommandLineRunner seedData(
            UserRepository users,
            CategoryRepository categories,
            EquipmentRepository equipment,
            InspectionRepository inspections,
            QuoteRequestRepository quoteRequests,
            NotificationRepository notifications) {
        return args -> {
            if (users.count() > 0) {
                return;
            }

            users.saveAll(List.of(
                    user("u-admin", "Kouadio Félix", "ADMIN", "VOLTA", "admin@volta.ci", "+225 07 00 00 01", "Abidjan"),
                    user("u-sup-1", "Boss Diarra", "SUPPLIER", "BTP CI SARL", "contact@btpci.ci", "+225 07 00 00 02", "Abidjan"),
                    user("u-sup-2", "Awa Koné", "SUPPLIER", "Afrique Matériel", "contact@afriquemateriel.ci", "+225 07 00 00 03", "Yamoussoukro"),
                    user("u-tech-1", "Yao Kouassi", "TECHNICAL", "Société Technique ABC", "inspection@abc.ci", "+225 07 00 00 04", "Abidjan"),
                    user("u-client-1", "Jean Konan", "CLIENT", "Entreprise BTP Konan", "jean@konan.ci", "+225 07 00 00 05", "Abidjan")));

            categories.saveAll(List.of(
                    category("c-pelle", "Pelles hydrauliques", "🚜"),
                    category("c-chargeuse", "Chargeuses", "🏗️"),
                    category("c-benne", "Bennes", "🚚"),
                    category("c-bulldozer", "Bulldozers", "🛠️"),
                    category("c-compacteur", "Compacteurs", "⚙️"),
                    category("c-grue", "Grues", "🏙️")));

            equipment.saveAll(List.of(
                    eq("eq-1", "Caterpillar 320D2", "c-pelle", "Caterpillar", "320D2", 2016, 4528,
                            "Abidjan, Côte d'Ivoire",
                            "Pelle hydraulique fiable, puissante et économique en carburant. Idéale pour les travaux de terrassement, carrières et grands chantiers.",
                            List.of(IMG_EXCAVATOR, IMG_EXCAVATOR_QUARRY, IMG_MINING_MACHINES),
                            List.of(new DocumentInfo("Certificat CE", "PDF"), new DocumentInfo("Rapport d'inspection", "PDF")),
                            "u-sup-1", "CATEGORISE", "A", "Très bon état", "2026-05-10"),
                    eq("eq-2", "Komatsu PC210LC-8", "c-pelle", "Komatsu", "PC210LC-8", 2018, 3900,
                            "Abidjan, Côte d'Ivoire",
                            "Pelle hydraulique polyvalente, entretien à jour, prête pour chantier.",
                            List.of(IMG_EXCAVATOR_QUARRY, IMG_EXCAVATOR),
                            List.of(new DocumentInfo("Certificat CE", "PDF")),
                            "u-sup-2", "CATEGORISE", "B", "Bon état", "2026-05-12"),
                    eq("eq-3", "Volvo A40G", "c-benne", "Volvo", "A40G", 2019, 2800,
                            "Abidjan, Côte d'Ivoire",
                            "Tombereau articulé grande capacité pour transport de matériaux.",
                            List.of(IMG_TRUCK, IMG_TRUCK_ROAD),
                            List.of(new DocumentInfo("Documentation technique", "PDF")),
                            "u-sup-1", "DISPONIBLE", null, "Très bon état", "2026-05-14"),
                    eq("eq-4", "Caterpillar D6T", "c-bulldozer", "Caterpillar", "D6T", 2015, 6100,
                            "Bouaké, Côte d'Ivoire",
                            "Bulldozer robuste pour travaux de nivellement et défrichage.",
                            List.of(IMG_MINING_MACHINES),
                            List.of(new DocumentInfo("Certificat CE", "PDF")),
                            "u-sup-2", "EN_INSPECTION", null, "Bon état", "2026-05-15"),
                    eq("eq-5", "Hitachi ZX350LC-5", "c-pelle", "Hitachi", "ZX350LC-5", 2017, 5200,
                            "Abidjan, Côte d'Ivoire",
                            "Pelle hydraulique lourde pour chantiers importants.",
                            List.of(IMG_EXCAVATOR, IMG_MINING_MACHINES),
                            List.of(new DocumentInfo("Facture", "PDF")),
                            "u-sup-1", "EN_INSPECTION", null, "Bon état", "2026-08-10"),
                    eq("eq-6", "JCB 3CX", "c-chargeuse", "JCB", "3CX", 2020, 1800,
                            "Abidjan, Côte d'Ivoire",
                            "Tractopelle compacte très maniable.",
                            List.of(IMG_CRANES),
                            List.of(),
                            "u-sup-1", "DISPONIBLE", null, "Très bon état", "2026-08-11")));

            QuoteRequest dv1 = quote("dv-001", "DV-2026-001", "eq-1", "u-sup-1",
                    "Acme Corp", "Acme Corporation", "+225 07 11 22 33", "contact@acme.ci",
                    "5 jours", "2026-08-20", "Abidjan Nord", "Travaux de terrassement urgent",
                    "NOUVELLE", "2026-08-12");
            QuoteRequest dv2 = quote("dv-002", "DV-2026-002", "eq-2", "u-sup-2",
                    "Construction Plus", "Construction Plus SARL", "+225 07 44 55 66", "info@constructionplus.ci",
                    "10 jours", "2026-08-25", "Yamoussoukro", "Projet de route",
                    "TRANSMISE", "2026-08-11");
            quoteRequests.saveAll(List.of(dv1, dv2));

            Inspection insp1 = new Inspection();
            insp1.id = "insp-1";
            insp1.quoteRequestId = "dv-002";
            insp1.equipmentId = "eq-4";
            insp1.technicalTeamId = "u-tech-1";
            insp1.assignedAt = "2026-08-12";
            insp1.status = "ASSIGNEE";
            insp1.checklist = checklist(null);
            inspections.save(insp1);

            notifications.saveAll(List.of(
                    new Notification("n-1", "SUPPLIER", "Nouvelle demande de devis DV-2026-001", "2026-08-12", false),
                    new Notification("n-2", "ADMIN", "Demande de devis DV-2026-001 reçue", "2026-08-12", false),
                    new Notification("n-3", "TECHNICAL", "Nouvelle mission d'inspection INS-001 assignée", "2026-08-12", false)));
        };
    }

    private static QuoteRequest quote(String id, String reference, String equipmentId, String supplierId,
            String clientName, String clientCompany, String clientPhone, String clientEmail, String duration,
            String requestedDate, String location, String message, String status, String createdAt) {
        QuoteRequest q = new QuoteRequest();
        q.id = id;
        q.reference = reference;
        q.equipmentId = equipmentId;
        q.supplierId = supplierId;
        q.clientName = clientName;
        q.clientCompany = clientCompany;
        q.clientPhone = clientPhone;
        q.clientEmail = clientEmail;
        q.duration = duration;
        q.requestedDate = requestedDate;
        q.location = location;
        q.message = message;
        q.status = status;
        q.createdAt = createdAt;
        return q;
    }

    private static Equipment eq(String id, String name, String categoryId, String brand, String model, int year,
            int hours, String location, String description, List<String> photos, List<DocumentInfo> documents,
            String supplierId, String status, String category, String declaredCondition, String createdAt) {
        Equipment e = new Equipment();
        e.id = id;
        e.name = name;
        e.categoryId = categoryId;
        e.brand = brand;
        e.model = model;
        e.year = year;
        e.hours = hours;
        e.location = location;
        e.description = description;
        e.photos = photos;
        e.documents = documents;
        e.supplierId = supplierId;
        e.status = status;
        e.category = category;
        e.declaredCondition = declaredCondition;
        e.createdAt = createdAt;
        return e;
    }
}
