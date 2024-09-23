package com.invoicegen.invoicegenapi.repositories;

import com.invoicegen.invoicegenapi.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<User, String> {
    User findByEmail(String email);
}
