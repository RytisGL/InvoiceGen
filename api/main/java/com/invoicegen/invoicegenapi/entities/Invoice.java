package com.invoicegen.invoicegenapi.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Size(max = 50)
    private String serial;
    private LocalDate issueDate;
    @Size(max = 50)
    private String issuedBy;
    @Size(max = 50)
    private String contactInfo;
    @ManyToOne()
    @Cascade(CascadeType.PERSIST)
    private Company seller;
    @ManyToOne()
    @Cascade(CascadeType.PERSIST)
    private Company buyer;
    @OneToMany(mappedBy = "invoice")
    @Cascade(CascadeType.ALL)
    private List<Product> products;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
