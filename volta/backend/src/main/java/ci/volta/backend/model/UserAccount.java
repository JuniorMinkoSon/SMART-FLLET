package ci.volta.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_users")
public class UserAccount {
    @Id
    public String id;
    public String name;
    public String role;
    public String company;
    public String email;
    public String phone;
    public String city;
}
