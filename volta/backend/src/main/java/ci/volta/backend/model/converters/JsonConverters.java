package ci.volta.backend.model.converters;

import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.DocumentInfo;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

public final class JsonConverters {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonConverters() {
    }

    private abstract static class JsonListConverter<T> implements AttributeConverter<List<T>, String> {
        private final TypeReference<List<T>> typeRef;

        JsonListConverter(TypeReference<List<T>> typeRef) {
            this.typeRef = typeRef;
        }

        @Override
        public String convertToDatabaseColumn(List<T> attribute) {
            try {
                return MAPPER.writeValueAsString(attribute == null ? List.of() : attribute);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to serialize list", e);
            }
        }

        @Override
        public List<T> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) {
                return new ArrayList<>();
            }
            try {
                return MAPPER.readValue(dbData, typeRef);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to deserialize list", e);
            }
        }
    }

    @Converter
    public static class StringListConverter extends JsonListConverter<String> {
        public StringListConverter() {
            super(new TypeReference<>() {
            });
        }
    }

    @Converter
    public static class ChecklistConverter extends JsonListConverter<ChecklistItem> {
        public ChecklistConverter() {
            super(new TypeReference<>() {
            });
        }
    }

    @Converter
    public static class DocumentListConverter extends JsonListConverter<DocumentInfo> {
        public DocumentListConverter() {
            super(new TypeReference<>() {
            });
        }
    }
}
