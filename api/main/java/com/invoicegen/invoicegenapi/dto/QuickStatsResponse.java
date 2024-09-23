package com.invoicegen.invoicegenapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuickStatsResponse {
    private Float totalSum;
    private Integer totalCountInvoices;
    private Float currentMonthTotal;
    private Float previousMonthTotal;
}
