package com.invoicegen.invoicegenapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatsResponse {
    private Float total;
    private Float totalWithoutVAT;
    private Float vatAmountTotal;
    private HashMap<String, Float> sellers;
    private HashMap<String, Float> buyers;
    private Integer invoiceCount;
    private Float highestInvoiceSum;
    private String highestInvoiceSellerName;
    private String highestInvoiceBuyerName;
}
