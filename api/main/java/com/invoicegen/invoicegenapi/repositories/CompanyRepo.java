package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.Company;
import com.invoicegen.invoicegenapi.entities.User;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface CompanyRepo extends JpaRepository<Company, Long> {
    void deleteByIdIsIn(Set<Long> ids);

    List<Company> findByInvoicesBuyer_UserOrderByCreatedAtDesc(User user, Limit limit);

    List<Company> findByInvoicesBuyer_UserAndNameContainingIgnoreCaseOrderByCreatedAtDesc(User user, String buyerName, Limit limit);
}
