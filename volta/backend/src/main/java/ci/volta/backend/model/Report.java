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
@Table(name = "reports")
public class Report {
    @Id
    public String id;
    public String inspectionId;
    public String equipmentId;
    public String submittedAt;
    @Column(length = 4000)
    public String summary;
    @Convert(converter = JsonConverters.ChecklistConverter.class)
    @Column(length = 16000)
    public List<ChecklistItem> checklist = new ArrayList<>();
}
