package com.invoicegen.invoicegenapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyRequest {
    private String name;
    private String address;
    private String companyCode;
    private String companyVATCode;
}
