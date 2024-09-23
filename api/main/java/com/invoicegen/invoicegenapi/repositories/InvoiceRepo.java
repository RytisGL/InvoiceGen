package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.Invoice;
import com.invoicegen.invoicegenapi.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepo extends JpaRepository<Invoice, Long> {
    List<Invoice> findByIdInAndUser(List<Long> ids, User user);
    Invoice findByIdAndUser(Long id, User user);
    List<Invoice> findByUser(User user);
    List<Invoice> findByIssueDateIsBetweenAndUser(LocalDate from, LocalDate to, User user);
}
