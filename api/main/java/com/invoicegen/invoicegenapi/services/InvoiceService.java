package com.invoicegen.invoicegenapi.services;

import com.invoicegen.invoicegenapi.dto.CompanyRequest;
import com.invoicegen.invoicegenapi.dto.InvoiceRequest;
import com.invoicegen.invoicegenapi.dto.InvoiceResponse;
import com.invoicegen.invoicegenapi.dto.ProductRequest;
import com.invoicegen.invoicegenapi.repositories.InvoiceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepo invoiceRepo;

    public String addInvoice(InvoiceRequest invoiceRequest, CompanyRequest companyRequestSeller,
                             CompanyRequest companyRequestBuyer, List<ProductRequest> productRequestList) {
        return null;

    }

    public InvoiceResponse getInvoice(InvoiceRequest invoiceRequest) {
        return null;
    }

    public List<InvoiceResponse> getInvoices() {
        return null;
    }
}
