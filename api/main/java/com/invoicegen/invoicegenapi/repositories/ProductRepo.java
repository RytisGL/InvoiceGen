package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.Product;
import com.invoicegen.invoicegenapi.entities.User;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.invoice.user = :user AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
            "AND p.createdAt = (SELECT MAX(p2.createdAt) FROM Product p2 WHERE p2.name = p.name) " +
            "ORDER BY p.createdAt DESC")
    List<Product> findByInvoice_UserAndNameContainingIgnoreCaseOrderByCreatedAtDesc(@Param("user") User user,
                                                                                    @Param("name") String name,
                                                                                    Limit limit);
    @Query("SELECT p FROM Product p WHERE p.invoice.user = :user " +
            "AND p.createdAt = (SELECT MAX(p2.createdAt) FROM Product p2 WHERE p2.name = p.name) " +
            "ORDER BY p.createdAt DESC")
    List<Product> findByInvoice_UserOrderByCreatedAtDesc(@Param("user") User user, Limit limit);
}
