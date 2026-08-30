package ci.volta.backend.model;

public class ChecklistItem {
    public String section;
    public String label;
    public String result;
    public String observation;

    public ChecklistItem() {
    }

    public ChecklistItem(String section, String label, String result, String observation) {
        this.section = section;
        this.label = label;
        this.result = result;
        this.observation = observation;
    }
}
