package com.invoicegen.invoicegenapi.controllers;

import com.invoicegen.invoicegenapi.dto.InvoiceRequest;
import com.invoicegen.invoicegenapi.dto.InvoiceResponse;
import com.invoicegen.invoicegenapi.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1")
@RequiredArgsConstructor
@CrossOrigin("*")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/invoice")
    public ResponseEntity<String> saveInvoice(@RequestBody InvoiceRequest invoice) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.saveInvoice(invoice));
    }

    @GetMapping("invoice")
    public ResponseEntity<Page<InvoiceResponse>> getInvoices(@RequestParam(value = "page", defaultValue = "0") Integer page,
                                                             @RequestParam(value = "size", defaultValue = "10") Integer size,
                                                             @RequestParam(value = "orderBy", defaultValue = "id") String orderBy,
                                                             @RequestParam(value = "direction", defaultValue = "ASC") String direction,
                                                             @RequestBody(required = false) InvoiceRequest filter) {
        return ResponseEntity.status(HttpStatus.OK).body(invoiceService.getInvoices(page, size, orderBy, direction,
                filter));
    }
}
