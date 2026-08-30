package ci.volta.backend.repository;

import ci.volta.backend.model.QuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, String> {
}
