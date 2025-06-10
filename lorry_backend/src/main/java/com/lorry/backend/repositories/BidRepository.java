package com.lorry.backend.repositories;

import com.lorry.backend.entities.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByUserId(Long userId);
    List<Bid> findByLoadId(Long loadId);
    List<Bid> findByLoadIdAndStatus(Long loadId, String status);
}
