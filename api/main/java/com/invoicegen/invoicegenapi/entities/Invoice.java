package com.invoicegen.invoicegenapi.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Date;
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
    @Column(unique=true)
    @Size(max = 50)
    @NotNull
    private String serial;
    @NotNull
    private Date issueDate;
    @NotNull
    @Size(max = 50)
    private String issuedBy;
    @Size(max = 50)
    private String contactInfo;
    @OneToOne
    @Cascade(CascadeType.ALL)
    private Company seller;
    @OneToOne
    @Cascade(CascadeType.ALL)
    private Company buyer;
    @OneToMany(mappedBy = "invoice")
    @Cascade(CascadeType.ALL)
    private List<Products> products;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
