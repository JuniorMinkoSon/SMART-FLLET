package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rental_requests")
public class RentalRequest {
    @Id
    public String id;
    public String reference;
    public String equipmentId;
    public String supplierId;
    public String startDate;
    public String endDate;
    public String location;
    public boolean withOperator;
    public boolean transport;
    @Column(length = 4000)
    public String comment;
    public String clientName;
    public String clientPhone;
    public String clientEmail;
    public String status;
    public String createdAt;
}
