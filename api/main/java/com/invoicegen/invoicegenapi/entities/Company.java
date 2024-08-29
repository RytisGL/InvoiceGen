package com.invoicegen.invoicegenapi.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Size(max = 50)
    @NotNull
    private String name;
    @Size(max = 50)
    @NotNull
    private String address;
    @Size(max = 50)
    @NotNull
    private String companyCode;
    @OneToMany(mappedBy = "seller")
    private List<Invoice> invoicesSeller;
    @OneToMany(mappedBy = "buyer")
    private List<Invoice> invoicesBuyer;
    @Size(max = 50)
    @NotNull
    private String companyVATCode;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
