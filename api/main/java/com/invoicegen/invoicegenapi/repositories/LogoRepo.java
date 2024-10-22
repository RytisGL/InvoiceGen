package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.Logo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogoRepo extends JpaRepository<Logo, Long> {
}
