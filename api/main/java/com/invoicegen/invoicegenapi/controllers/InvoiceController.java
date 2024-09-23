package com.invoicegen.invoicegenapi.controllers;

import com.invoicegen.invoicegenapi.Utils;
import com.invoicegen.invoicegenapi.dto.*;
import com.invoicegen.invoicegenapi.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("api/v1/invoice")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping()
    public ResponseEntity<String> saveInvoice(@RequestBody InvoiceRequest invoice) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.saveInvoice(invoice));
    }

    @GetMapping("/preview")
    public ResponseEntity<Page<InvoicePreviewResponse>> getInvoicePreviews(@RequestParam(value = "page", defaultValue = "0") Integer page,
                                                                           @RequestParam(value = "size", defaultValue = "15") Integer size,
                                                                           @RequestParam(value = "orderBy",
                                                                     defaultValue = "id") String orderBy,
                                                                           @RequestParam(value = "direction",
                                                                     defaultValue = "DESC") String direction,
                                                                           @RequestParam(value = "buyer", required = false) String buyer,
                                                                           @RequestParam(value = "dateFrom",
                                                                                   required = false) LocalDate dateFrom) {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.getInvoicesPreview(page, size, orderBy, direction,
                buyer, dateFrom
                ));
    }

    @GetMapping()
    public ResponseEntity<List<InvoiceResponse>> getInvoices(@RequestParam(value = "ids") String ids) {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.getInvoices(Utils.parseStringIdsToLongList(ids)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.getInvoicesById(id));
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteInvoice(@RequestParam String ids) {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.deleteInvoiceById(Utils.parseStringIdsToLongList(ids)));
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.getStats(startDate, endDate));
    }

    @PatchMapping("user/info")
    public ResponseEntity<String> changeUserInfo(@RequestBody UserInfoRequest userInfo) {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.changeInfo(userInfo));
    }

    @DeleteMapping("user")
    public ResponseEntity<String> deleteUser() {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.deleteUser());
    }
}
