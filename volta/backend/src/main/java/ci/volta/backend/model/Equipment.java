package ci.volta.backend.model;

import ci.volta.backend.model.converters.JsonConverters;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipment")
public class Equipment {
    @Id
    public String id;
    public String name;
    public String categoryId;
    public String brand;
    public String model;
    @Column(name = "model_year")
    public int year;
    public int hours;
    public String location;
    public long pricePerDay;
    public boolean available;
    public boolean withOperator;
    @Column(length = 4000)
    public String description;
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(length = 8000)
    public List<String> photos = new ArrayList<>();
    @Convert(converter = JsonConverters.DocumentListConverter.class)
    @Column(length = 8000)
    public List<DocumentInfo> documents = new ArrayList<>();
    public String supplierId;
    public String status;
    public String category;
    public String level;
    public String declaredCondition;
    public String createdAt;
}
