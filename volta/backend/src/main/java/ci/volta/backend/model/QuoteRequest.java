package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "quote_requests")
public class QuoteRequest {
    @Id
    public String id;
    public String reference;
    public String equipmentId;
    public String supplierId;
    public String clientName;
    public String clientCompany;
    public String clientPhone;
    public String clientEmail;
    public String duration;
    public String requestedDate;
    public String location;
    @Column(length = 4000)
    public String message;
    public String status;
    public String createdAt;
}
