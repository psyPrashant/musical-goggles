package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findByNameIgnoreCase(String name);

    @Query("SELECT t FROM Tag t WHERE EXISTS (SELECT qt FROM Question qt JOIN qt.tags tg WHERE tg = t) ORDER BY t.name ASC")
    List<Tag> findAllInUse();

    @Query("SELECT t FROM Tag t WHERE NOT EXISTS (SELECT qt FROM Question qt JOIN qt.tags tg WHERE tg = t)")
    List<Tag> findOrphans();
}
