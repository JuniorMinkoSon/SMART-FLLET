package ci.volta.backend.repository;

import ci.volta.backend.model.RentalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalRequestRepository extends JpaRepository<RentalRequest, String> {
}
