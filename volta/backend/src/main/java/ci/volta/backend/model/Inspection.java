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
@Table(name = "inspections")
public class Inspection {
    @Id
    public String id;
    public String quoteRequestId;
    public String equipmentId;
    public String technicalTeamId;
    public String assignedAt;
    public String status;
    @Convert(converter = JsonConverters.ChecklistConverter.class)
    @Column(length = 16000)
    public List<ChecklistItem> checklist = new ArrayList<>();
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(length = 8000)
    public List<String> photos = new ArrayList<>();
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(length = 8000)
    public List<String> anomalies = new ArrayList<>();
}
