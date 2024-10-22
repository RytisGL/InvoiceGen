package com.invoicegen.invoicegenapi.services;

import com.invoicegen.invoicegenapi.Utils;
import com.invoicegen.invoicegenapi.conveters.Converter;
import com.invoicegen.invoicegenapi.dto.*;
import com.invoicegen.invoicegenapi.entities.Company;
import com.invoicegen.invoicegenapi.entities.Invoice;
import com.invoicegen.invoicegenapi.entities.Product;
import com.invoicegen.invoicegenapi.entities.User;
import com.invoicegen.invoicegenapi.repositories.CompanyRepo;
import com.invoicegen.invoicegenapi.repositories.InvoiceRepo;
import com.invoicegen.invoicegenapi.repositories.ProductRepo;
import com.invoicegen.invoicegenapi.repositories.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final ProductRepo productRepo;
    private final InvoiceRepo invoiceRepo;
    private final CompanyRepo companyRepo;
    private final UserRepo userRepo;

    public String saveInvoice(InvoiceRequest invoiceRequest) {

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOptional = userRepo.findById(userEmail);

        User user = userOptional.orElseGet(() -> User.builder().email(userEmail).build());

        if (userOptional.isEmpty()) {
            userRepo.save(user);
        }

        if (user.getCompany() == null) {
            throw new NoSuchElementException("Company not found");
        }

        Invoice invoice = Converter.invoiceRequestToInvoice(invoiceRequest);
        invoice.setSeller(user.getCompany());

        replaceDuplicateCompanies(invoice);
        invoice.setUser(user);

        this.invoiceRepo.saveAndFlush(invoice);

        return "Invoice saved";
    }

    public List<InvoiceResponse> getInvoices(List<Long> ids) {
        User user = Utils.getUserFromSecurityContext();
        return invoiceRepo.findByIdInAndUser(ids, user).stream().map(Converter::invoiceToInvoiceResponse).toList();
    }

    public Page<InvoicePreviewResponse> getInvoicesPreview(
            Integer page,
            Integer size,
            String orderBy,
            String direction,
            String buyer,
            LocalDate dateFrom) {
        Sort.Direction sortDirection = (direction != null && !direction.isEmpty()) ?
                Sort.Direction.fromString(direction) : Sort.Direction.ASC;

        User user = Utils.getUserFromSecurityContext();

        List<Invoice> invoices;

        if (buyer != null && dateFrom != null) {
            invoices = invoiceRepo.findByUserAndBuyer_NameContainingIgnoreCaseAndIssueDateAfter(user, buyer, dateFrom);
        } else if (buyer != null) {
            invoices = invoiceRepo.findByUserAndBuyer_NameContainingIgnoreCase(user, buyer);
        } else if (dateFrom != null) {
            invoices = invoiceRepo.findByUserAndIssueDateAfter(user, dateFrom);
        } else {
            invoices = invoiceRepo.findByUser(user);
        }

        List<InvoicePreviewResponse> invoiceDTOs = invoices.stream()
                .map(Converter::invoiceToInvoicePreviewResponse)
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

    public InvoiceResponse getInvoicesById(Long id) {
        Invoice invoice = invoiceRepo.findByIdAndUser(id, Utils.getUserFromSecurityContext());
        if (invoice != null) {
            return Converter.invoiceToInvoiceResponse(invoice);
        }
        return null;
    }

    @Transactional
    public String deleteInvoiceById(List<Long> ids) {
        List<Invoice> invoices = invoiceRepo.findByIdInAndUser(ids, Utils.getUserFromSecurityContext());

        Set<Long> companiesIdsToDelete = new HashSet<>();
        if (invoices.isEmpty()) {
            throw new NoSuchElementException("Not found");
        }
        //Checks if companies have any other invoices connected, if not adds to the list to be deleted, deletes invoice.
        for (Invoice invoice : invoices) {
            Utils.deleteCompanyIfNoAdditionalInvoices(invoice.getBuyer(), invoice.getSeller(), companiesIdsToDelete);
            invoiceRepo.delete(invoice);
        }
        //Deletes companies that has no attached invoices.
        companyRepo.deleteByIdIsIn(companiesIdsToDelete);

        return "Deleted";
    }

    public NextSerialResponse getNextSerial() {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
        Invoice invoice = this.invoiceRepo.findFirstByUserOrderByCreatedAtDesc(user);
        if (invoice == null) {
            return NextSerialResponse.builder()
                    .serial("")
                    .build();
        }
        String serial = invoice.getSerial();
        String nonDigit = "";
        long digit = 0;
        for (int i = 0; i < serial.length(); i++) {
            if (Character.isDigit(serial.charAt(i))) {
                digit = Long.parseLong(serial.substring(i));
                break;
            } else {
                nonDigit = serial.substring(0, i + 1);
            }
        }

        digit++;

        return NextSerialResponse.builder()
                .serial(nonDigit + digit)
                .build();
    }


    public List<CompanyResponse> getCompaniesByName(String name) {
        User user = Utils.getUserFromSecurityContext();

        List<Company> companies;

        Limit limit = Limit.of(5);

        if (!name.isEmpty()) {
            companies = companyRepo.findByInvoicesBuyer_UserAndNameContainingIgnoreCaseOrderByCreatedAtDesc(user, name, limit);
        } else {
            companies = companyRepo.findByInvoicesBuyer_UserOrderByCreatedAtDesc(user, limit);
        }

        return Converter.companyListToCompanyResponse(companies);
    }

    public List<ProductResponse> getProductsByName(String name) {
        User user = Utils.getUserFromSecurityContext();

        List<Product> products;

        Limit limit = Limit.of(5);

        if (!name.isEmpty()) {
            products = productRepo.findByInvoice_UserAndNameContainingIgnoreCaseOrderByCreatedAtDesc(user, name, limit);
        } else {
            products = productRepo.findByInvoice_UserOrderByCreatedAtDesc(user, limit);
        }

        return products.stream()
                .map(Converter::productToProductResponse)
                .collect(Collectors.toList());
    }

    private void orderInvoices(List<InvoicePreviewResponse> invoiceDTOs, String orderBy,
                               Sort.Direction sortDirection) {
        Comparator<InvoicePreviewResponse> comparator = switch (orderBy) {
            case "serial" -> Comparator.comparing(InvoicePreviewResponse::getSerial);
            case "companyName" -> Comparator.comparing(InvoicePreviewResponse::getSellerName);
            case "issueDate" -> Comparator.comparing(InvoicePreviewResponse::getIssueDate);
            case "sum" -> Comparator.comparing(InvoicePreviewResponse::getSum);
            default -> Comparator.comparing(InvoicePreviewResponse::getId);
        };

        if (sortDirection == Sort.Direction.DESC) {
            comparator = comparator.reversed();
        }
        invoiceDTOs.sort(comparator);
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
}
