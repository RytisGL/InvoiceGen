package com.invoicegen.invoicegenapi.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Products {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    @Size(max = 50)
    private String name;
    @NotNull
    @Size(max = 50)
    private String unitOfMeasure;
    @NotNull
    private Float quantity;
    @NotNull
    private Float unitPrice;
    @NotNull
    private Float vatAmount;
    @ManyToOne()
    @Cascade(CascadeType.ALL)
    private Invoice invoice;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
