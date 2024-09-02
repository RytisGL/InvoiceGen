package com.invoicegen.invoicegenapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoicePreviewResponse {
    private Long id;
    private String serial;
    private String companyName;
    private LocalDate issueDate;
    private Float sum;
}
