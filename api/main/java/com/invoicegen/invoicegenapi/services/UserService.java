package com.invoicegen.invoicegenapi.services;

import com.invoicegen.invoicegenapi.Utils;
import com.invoicegen.invoicegenapi.conveters.Converter;
import com.invoicegen.invoicegenapi.dto.*;
import com.invoicegen.invoicegenapi.entities.*;
import com.invoicegen.invoicegenapi.repositories.CompanyRepo;
import com.invoicegen.invoicegenapi.repositories.InvoiceRepo;
import com.invoicegen.invoicegenapi.repositories.LogoRepo;
import com.invoicegen.invoicegenapi.repositories.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.zip.DataFormatException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final InvoiceRepo invoiceRepo;
    private final CompanyRepo companyRepo;
    private final LogoRepo logoRepo;

    public StatsResponse getStats(LocalDate startDate, LocalDate endDate) {
        HashMap<String, Float> buyers = new HashMap<>();
        float vatAmount = 0f;
        float total = 0f;
        List<Invoice> invoices;
        if (startDate != null && endDate != null) {
            invoices = invoiceRepo.findByIssueDateIsBetweenAndUser(startDate, endDate, Utils.getUserFromSecurityContext());
        } else {
            invoices = invoiceRepo.findByUser(Utils.getUserFromSecurityContext());
        }
        for (Invoice invoice : invoices) {
            Float sum = Utils.countTotalInvoiceSum(invoice);

            if (!buyers.containsKey(invoice.getBuyer().getName())) {
                buyers.put(invoice.getBuyer().getName(), 0f);
            }
            buyers.put(invoice.getBuyer().getName(),
                    buyers.get(invoice.getBuyer().getName()) + sum);
            total += Utils.countTotalInvoiceSum(invoice);
            for (Product product : invoice.getProducts()) {
                vatAmount += Utils.countVatAmount(product);
            }
        }
        return StatsResponse.builder()
                .buyers(buyers)
                .vatAmountTotal(Utils.roundFloat(vatAmount, 2))
                .total(Utils.roundFloat(total, 2))
                .totalWithoutVAT(Utils.roundFloat((Utils.roundFloat(total, 2) - Utils.roundFloat(vatAmount, 2)), 2))
                .build();
    }


    public String changeUserInfo(UserInfoRequest userInfo) {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
        if (user == null) {
            user = Utils.getUserFromSecurityContext();
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
            Utils.deleteCompanyIfNoAdditionalInvoices(invoice.getBuyer(), invoice.getSeller(), companiesIdsToDelete);
        }
        companyRepo.deleteByIdIsIn(companiesIdsToDelete);
        userRepo.delete(user);
        return "Deleted";
    }


    public InfoResponse getUserInfo() {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());

        if (user == null || user.getInfo() == null) {
            return InfoResponse.builder()
                    .info("")
                    .build();
        }

        return InfoResponse.builder()
                .info(user.getInfo())
                .build();
    }


    public CompanyResponse getUserCompany() {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());

        if (user == null || user.getCompany() == null) {
            return CompanyResponse.builder()
                    .companyVATCode("")
                    .name("")
                    .address("")
                    .companyCode("")
                    .build();
        }

        return Converter.companyToCompanyResponse(user.getCompany());
    }

    public LastThreeMonthsResponse getLastThreeMonthsTotals() {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());

        LocalDate dateFrom = LocalDate.now().minusMonths(3).withDayOfMonth(1).minusDays(1);

        List<Invoice> invoices = this.invoiceRepo.findByUserAndIssueDateAfter(user, dateFrom);
        HashMap<Integer, Float> lastThreeMonths = new HashMap<>();
        Integer month;
        for (Invoice invoice : invoices) {
            month = invoice.getIssueDate().getMonth().getValue();
            if (!lastThreeMonths.containsKey(month)) {
                lastThreeMonths.put(month, 0f);
            }
            Float sum = Utils.countTotalInvoiceSum(invoice);
            lastThreeMonths.put(month, lastThreeMonths.get(month) + sum);
        }

        //Adding missing months data
        if (lastThreeMonths.size() > 3) {
            if (!lastThreeMonths.containsKey(LocalDate.now().getMonth().getValue())) {
                lastThreeMonths.put(LocalDate.now().getMonth().getValue(), 0f);
            }
            if (!lastThreeMonths.containsKey(LocalDate.now().minusMonths(1).getMonth().getValue())) {
                lastThreeMonths.put(LocalDate.now().minusMonths(1).getMonth().getValue(), 0f);
            }
            if (!lastThreeMonths.containsKey(LocalDate.now().minusMonths(2).getMonth().getValue())) {
                lastThreeMonths.put(LocalDate.now().minusMonths(2).getMonth().getValue(), 0f);
            }
        }

        return LastThreeMonthsResponse.builder()
                .totalsEachMonth(lastThreeMonths)
                .build();
    }

    public String changeUserCompany(CompanyRequest companyRequest) {
        User user = userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
        if (user == null) {
            user = Utils.getUserFromSecurityContext();
        }
        Company company = Converter.companyRequestToCompany(companyRequest);
        user.setCompany(company);
        this.userRepo.saveAndFlush(user);
        return "Saved";
    }

    @Transactional
    public String uploadLogo(MultipartFile imageFile) throws IOException {
        User user = userRepo.findByEmail(Utils.getUserEmailFromSecurityContext());

        if (user == null) {
            user = userRepo.saveAndFlush(Utils.getUserFromSecurityContext());
        }

        if (user.getLogo() != null) {
            logoRepo.delete(user.getLogo());
        }

        Logo imageToSave = Logo.builder()
                .name(imageFile.getOriginalFilename())
                .type(imageFile.getContentType())
                .imageData(Utils.compressImage(imageFile.getBytes()))
                .build();
        user.setLogo(imageToSave);

        userRepo.saveAndFlush(user);
        return "file uploaded successfully : " + imageFile.getOriginalFilename();
    }

    public byte[] getLogo() {
        User user = userRepo.findByEmail(Utils.getUserEmailFromSecurityContext());

        if (user == null || user.getLogo() == null) {
            return new byte[0];
        }

        Logo dbImage = user.getLogo();

        try {
            return Utils.decompressImage(dbImage.getImageData());
        } catch (DataFormatException | IOException exception) {
            throw new RuntimeException("Error downloading an image");
        }
    }
}

