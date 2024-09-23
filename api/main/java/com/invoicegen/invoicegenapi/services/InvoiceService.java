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

    private final InvoiceRepo invoiceRepo;
    private final CompanyRepo companyRepo;
    private final UserRepo userRepo;

    public String saveInvoice(InvoiceRequest invoiceRequest) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOptional = userRepo.findById(userEmail);

        User user = userOptional.orElseGet(() -> User.builder().email(userEmail).build());

        Invoice invoice = Converter.invoiceRequestToInvoice(invoiceRequest);

        replaceDuplicateCompanies(invoice);
        invoice.setUser(user);

        this.invoiceRepo.saveAndFlush(invoice);
        return "Invoice saved";
    }

    public List<InvoiceResponse> getInvoices(List<Long> ids) {
        User user = getUserFromSecurityContext();
        return invoiceRepo.findByIdInAndUser(ids, user).stream().map(Converter::invoiceToInvoiceResponse).collect(Collectors.toList());
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

        User user = getUserFromSecurityContext();

        List<Invoice> invoices;
        Invoice filter = getInvoice(buyer);
        filter.setUser(user);

        Example<Invoice> example = Example.of(filter);
        invoices = invoiceRepo.findAll(example);

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

    public InvoiceResponse getInvoicesById(Long id) {
        Invoice invoice = invoiceRepo.findByIdAndUser(id, getUserFromSecurityContext());
        if (invoice != null) {
            return Converter.invoiceToInvoiceResponse(invoice);
        }
        return null;
    }

    @Transactional
    public String deleteInvoiceById(List<Long> ids) {
        List<Invoice> invoices = invoiceRepo.findByIdInAndUser(ids, getUserFromSecurityContext());

        Set<Long> companiesIdsToDelete = new HashSet<>();
        if (invoices.isEmpty()) {
            throw new NoSuchElementException("Not found");
        }
        //Checks if companies have any other invoices connected, if not adds to the list to be deleted, deletes invoice.
        for (Invoice invoice : invoices) {
            deleteCompanyIfNoAdditionalInvoices(invoice.getBuyer(), invoice.getSeller(), companiesIdsToDelete);
            invoiceRepo.delete(invoice);
        }
        //Deletes companies that has no attached invoices.
        companyRepo.deleteByIdIsIn(companiesIdsToDelete);

        return "Deleted";
    }

    public StatsResponse getStats(LocalDate startDate, LocalDate endDate) {
        HashMap<String, Float> sellers = new HashMap<>();
        HashMap<String, Float> buyers = new HashMap<>();
        Float vatAmount = 0f;
        Float total = 0f;
        String highestBuyer = "";
        String highestSeller = "";
        Float highestInvoiceSum = 0f;
        List<Invoice> invoices;
        if (startDate != null && endDate != null) {
            invoices = invoiceRepo.findByIssueDateIsBetweenAndUser(startDate, endDate, getUserFromSecurityContext());
        } else {
            invoices = invoiceRepo.findByUser(getUserFromSecurityContext());
        }
        for (Invoice invoice : invoices) {
            Float sum = Utils.countTotalSum(invoice);
            if (sum > highestInvoiceSum) {
                highestInvoiceSum = sum;
                highestBuyer = invoice.getBuyer().getName();
                highestSeller = invoice.getSeller().getName();
            }
            if (!sellers.containsKey(invoice.getSeller().getName())) {
                sellers.put(invoice.getSeller().getName(), 0f);
            }
            if (!buyers.containsKey(invoice.getBuyer().getName())) {
                buyers.put(invoice.getBuyer().getName(), 0f);
            }
            sellers.put(invoice.getSeller().getName(),
                    sellers.get(invoice.getSeller().getName()) + sum);
            buyers.put(invoice.getBuyer().getName(),
                    buyers.get(invoice.getBuyer().getName()) + sum);
            total += Utils.countTotalSum(invoice);
            for (Product product : invoice.getProducts()) {
                vatAmount += Utils.countVatAmount(product);
            }
        }
        return StatsResponse.builder()
                .sellers(sellers)
                .buyers(buyers)
                .vatAmountTotal(Utils.roundFloat(vatAmount, 2))
                .total(Utils.roundFloat(total, 2))
                .totalWithoutVAT(Utils.roundFloat((Utils.roundFloat(total, 2) - Utils.roundFloat(vatAmount, 2)), 2))
                .highestInvoiceSum(Utils.roundFloat(highestInvoiceSum, 2))
                .highestInvoiceBuyerName(highestBuyer)
                .highestInvoiceSellerName(highestSeller)
                .invoiceCount(invoices.size())
                .build();
    }

    public String changeInfo(UserInfoRequest userInfo) {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
        if (user == null) {
            user = getUserFromSecurityContext();
        }
        user.setInfo(userInfo.getInfo());
        userRepo.saveAndFlush(user);
        return "Saved";
    }

    @Transactional
    public String deleteUser() {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
        if (user == null) {
            return "User not found";
        }
        Set<Long> companiesIdsToDelete = new HashSet<>();
        for (Invoice invoice : user.getInvoices()) {
            deleteCompanyIfNoAdditionalInvoices(invoice.getBuyer(), invoice.getSeller(), companiesIdsToDelete);
        }
        companyRepo.deleteByIdIsIn(companiesIdsToDelete);
        userRepo.delete(user);
        return "Deleted";
    }

    private void deleteCompanyIfNoAdditionalInvoices(Company buyer, Company seller, Set<Long> checkedCompanies) {
        if (buyer.getInvoicesBuyer().size() == 1) {
            checkedCompanies.add(buyer.getId());
        }
        if (seller.getInvoicesSeller().size() == 1) {
            checkedCompanies.add(seller.getId());
        }
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

    private Invoice getInvoice(String buyer) {
        Invoice filter = new Invoice();
        if (buyer != null) {
                Company buyerFilter = new Company();
                buyerFilter.setName(buyer);
                filter.setBuyer(buyerFilter);
            }
        return filter;
    }

    private User getUserFromSecurityContext() {
        return User.builder()
                .email(SecurityContextHolder.getContext().getAuthentication().getName())
                .build();
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
