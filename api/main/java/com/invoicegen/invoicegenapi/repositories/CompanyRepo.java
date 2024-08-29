package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepo extends JpaRepository<Company, Long> {
}
