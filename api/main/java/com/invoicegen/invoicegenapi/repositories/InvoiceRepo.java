package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepo extends JpaRepository<Invoice, Long> {
}
