package com.lorry.backend.repositories;

import com.lorry.backend.entities.Load;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoadRepository extends JpaRepository<Load, Long> {
    List<Load> findByStatusInAndAssignedDriverIsNull(List<String> statuses);
    List<Load> findByAssignedDriverId(Long driverId);
    List<Load> findByPostedByUserId(Long userId);
}
