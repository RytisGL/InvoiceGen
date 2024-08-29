package com.invoicegen.invoicegenapi.services;

import com.invoicegen.invoicegenapi.conveters.Converter;
import com.invoicegen.invoicegenapi.dto.InvoiceRequest;
import com.invoicegen.invoicegenapi.dto.InvoiceResponse;
import com.invoicegen.invoicegenapi.entities.Company;
import com.invoicegen.invoicegenapi.entities.Invoice;
import com.invoicegen.invoicegenapi.repositories.CompanyRepo;
import com.invoicegen.invoicegenapi.repositories.InvoiceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepo invoiceRepo;
    private final CompanyRepo companyRepo;

    public String saveInvoice(InvoiceRequest invoiceRequest) {
        Invoice invoice = Converter.invoiceRequestToInvoice(invoiceRequest);
        replaceDuplicateCompanies(invoice);
        this.invoiceRepo.saveAndFlush(invoice);
        return "Invoice saved";
    }

    private void replaceDuplicateCompanies(Invoice invoice) {
        List<Company> seller = companyRepo.findAll(Example.of(invoice.getSeller()));
        if (!seller.isEmpty()) {
            invoice.setSeller(seller.get(0));
        }
        List<Company> buyer = companyRepo.findAll(Example.of(invoice.getBuyer()));
        if (!buyer.isEmpty()) {
            invoice.setBuyer(buyer.get(0));
        }
    }

    public Page<InvoiceResponse> getInvoices(Integer page,
                                             Integer size,
                                             String orderBy,
                                             String direction,
                                             InvoiceRequest filter) {
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, orderBy));
        Page<Invoice> invoicePages;
        if (filter != null) {
            invoicePages = invoiceRepo.findAll(Example.of(Converter.invoiceRequestToInvoice(filter)),
                    pageable);
        } else {
            invoicePages = invoiceRepo.findAll(pageable);
        }
        return invoicePages.map(Converter::invoiceToInvoiceResponse);
    }
}
