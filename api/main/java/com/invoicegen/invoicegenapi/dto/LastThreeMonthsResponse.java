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
public class LastThreeMonthsResponse {
    private HashMap<Integer, Float> totalsEachMonth;
}