package com.auction.app.domains.products;

import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(value = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.tags " +
            "WHERE p.owner.id = :ownerId " +
            "AND (CAST(:keyword AS string) IS NULL OR LOWER(p.productName) LIKE :keyword) " +
            "AND (:tags IS NULL OR EXISTS (SELECT 1 FROM p.tags t WHERE t IN :tags))",
            countQuery = "SELECT COUNT(p) FROM Product p " +
                    "WHERE p.owner.id = :ownerId " +
                    "AND (CAST(:keyword AS string) IS NULL OR LOWER(p.productName) LIKE :keyword) " +
                    "AND (:tags IS NULL OR EXISTS (SELECT 1 FROM p.tags t WHERE t IN :tags))")
    Page<Product> findByKeywordAndTags(@Param("ownerId") Long ownerId,
                                       @Param("keyword") String keyword,
                                       @Param("tags") Set<Tag> tags,
                                       Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.owner.id = :currentUserId")
    Optional<Product> findByIdAndOwnerUserId(@Param("id") Long id, @Param("currentUserId") Long currentUserId);
}