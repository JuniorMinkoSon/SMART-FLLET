package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    public String id;
    public String role;
    @Column(length = 2000)
    public String message;
    public String date;
    public boolean read;

    public Notification() {
    }

    public Notification(String id, String role, String message, String date, boolean read) {
        this.id = id;
        this.role = role;
        this.message = message;
        this.date = date;
        this.read = read;
    }
}
