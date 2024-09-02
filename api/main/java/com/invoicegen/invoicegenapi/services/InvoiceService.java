package com.invoicegen.invoicegenapi.services;

import com.invoicegen.invoicegenapi.conveters.Converter;
import com.invoicegen.invoicegenapi.dto.InvoicePreviewResponse;
import com.invoicegen.invoicegenapi.dto.InvoiceRequest;
import com.invoicegen.invoicegenapi.dto.InvoiceResponse;
import com.invoicegen.invoicegenapi.entities.Company;
import com.invoicegen.invoicegenapi.entities.Invoice;
import com.invoicegen.invoicegenapi.repositories.CompanyRepo;
import com.invoicegen.invoicegenapi.repositories.InvoiceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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

    public Page<InvoicePreviewResponse> getInvoicesPreview(
            Integer page,
            Integer size,
            String orderBy,
            String direction,
            String buyer,
            String seller,
            LocalDate dateFrom) {

        Sort.Direction sortDirection = (direction != null && !direction.isEmpty()) ?
                Sort.Direction.fromString(direction) : Sort.Direction.ASC;

        List<Invoice> invoices;
        Invoice filter = getInvoice(buyer, seller);

        if (filter != null) {
            Example<Invoice> example = Example.of(filter);
            invoices = invoiceRepo.findAll(example);
        } else {
            invoices = invoiceRepo.findAll();
        }

        List<InvoicePreviewResponse> invoiceDTOs = invoices.stream()
                .map(Converter::invoicePreviewToInvoicePreviewResponse)
                .collect(Collectors.toList());

        if (dateFrom != null) {
            invoiceDTOs = invoiceDTOs.stream()
                    .filter(dto -> !dto.getIssueDate().isBefore(dateFrom))
                    .collect(Collectors.toList());
        }

        orderInvoices(invoiceDTOs, orderBy, sortDirection);

        int start = Math.min(page * size, invoiceDTOs.size());
        int end = Math.min(start + size, invoiceDTOs.size());
        List<InvoicePreviewResponse> paginatedDTOs = invoiceDTOs.subList(start, end);

        return new PageImpl<>(paginatedDTOs, PageRequest.of(page, size), invoiceDTOs.size());
    }

    private void orderInvoices(List<InvoicePreviewResponse> invoiceDTOs, String orderBy,
                                                       Sort.Direction sortDirection) {

        Comparator<InvoicePreviewResponse> comparator = switch (orderBy) {
            case "serial" -> Comparator.comparing(InvoicePreviewResponse::getSerial);
            case "companyName" -> Comparator.comparing(InvoicePreviewResponse::getCompanyName);
            case "issueDate" -> Comparator.comparing(InvoicePreviewResponse::getIssueDate);
            case "sum" -> Comparator.comparing(InvoicePreviewResponse::getSum);
            default -> Comparator.comparing(InvoicePreviewResponse::getId);
        };

        if (sortDirection == Sort.Direction.DESC) {
            comparator = comparator.reversed();
        }
        invoiceDTOs.sort(comparator);
    }

    private Invoice getInvoice(String buyer, String seller) {
        Invoice filter = null;
        if (buyer != null || seller != null) {
            filter = new Invoice();
            if (buyer != null) {
                Company buyerFilter = new Company();
                buyerFilter.setName(buyer);
                filter.setBuyer(buyerFilter);
            }
            if (seller != null) {
                Company sellerFilter = new Company();
                sellerFilter.setName(seller);
                filter.setSeller(sellerFilter);
            }
        }
        return filter;
    }

    public InvoiceResponse getInvoicesById(Long id) {
        return Converter.invoiceToInvoiceResponse(invoiceRepo.findById(id).orElseThrow());
    }
}
