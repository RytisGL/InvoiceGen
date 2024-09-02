package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.Invoice;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.*;


import java.time.LocalDate;

@Repository
public interface InvoiceRepo extends JpaRepository<Invoice, Long> {
    Page<Invoice> findAllByIssueDateAfter(LocalDate issueDate, Example<Invoice> example, Pageable pageable);
    Page<Invoice> findByIssueDateAfter(LocalDate date, Pageable pageable);
}
