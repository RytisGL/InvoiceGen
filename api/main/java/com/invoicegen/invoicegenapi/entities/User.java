package com.invoicegen.invoicegenapi.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;

import java.util.List;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class User {
    @Id
    @Column(unique = true)
    private String email;
    @Size(max = 50)
    private String info;
    @OneToMany(mappedBy = "user")
    @Cascade(value = CascadeType.ALL)
    private List<Invoice> invoices;
}
