package com.invoicegen.invoicegenapi.conveters;

import com.invoicegen.invoicegenapi.dto.*;
import com.invoicegen.invoicegenapi.entities.Company;
import com.invoicegen.invoicegenapi.entities.Invoice;
import com.invoicegen.invoicegenapi.entities.Product;

import java.util.ArrayList;
import java.util.List;

public abstract class Converter {
    private Converter() {}

    public static Company companyRequestToCompany(CompanyRequest companyRequest) {
        return Company.builder()
                .companyCode(companyRequest.getCompanyCode())
                .name(companyRequest.getName())
                .companyVATCode(companyRequest.getCompanyVATCode())
                .address(companyRequest.getAddress())
                .build();
    }

    public static Product productRequestToProduct(ProductRequest productRequest, Invoice invoice) {
        return Product.builder()
                .quantity(productRequest.getQuantity())
                .name(productRequest.getName())
                .unitOfMeasure(productRequest.getUnitOfMeasure())
                .vatPercent(productRequest.getVatPercent())
                .unitPrice(productRequest.getVatPercent())
                .invoice(invoice)
                .build();
    }

    public static List<Product> companyRequestListToCompanyList(List<ProductRequest> productRequestList, Invoice invoice) {
        List<Product> productList = new ArrayList<>();
        for (ProductRequest productRequest : productRequestList) {
            productList.add(productRequestToProduct(productRequest, invoice));
        }
        return productList;
    }

    public static Invoice invoiceRequestToInvoice(InvoiceRequest invoiceRequest) {
        Invoice invoice = new Invoice();
        invoice.setSerial(invoiceRequest.getSerial());
        invoice.setBuyer(companyRequestToCompany(invoiceRequest.getBuyer()));
        invoice.setSeller(companyRequestToCompany(invoiceRequest.getSeller()));
        invoice.setIssueDate(invoiceRequest.getIssueDate());
        invoice.setIssuedBy(invoiceRequest.getIssuedBy());
        invoice.setProducts(companyRequestListToCompanyList(invoiceRequest.getProductList(), invoice));
        return invoice;
    }

    public static CompanyResponse companyToCompanyResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .address(company.getAddress())
                .companyCode(company.getCompanyCode())
                .companyVATCode(company.getCompanyVATCode())
                .build();
    }

    public static ProductResponse productToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .vatPercent(product.getVatPercent())
                .unitOfMeasure(product.getUnitOfMeasure())
                .name(product.getName())
                .unitPrice(product.getUnitPrice())
                .quantity(product.getQuantity())
                .build();
    }

    public static List<ProductResponse> productListToProductResponse(List<Product> productList) {
        List<ProductResponse> productResponseList = new ArrayList<>();
        for (Product product : productList) {
            productResponseList.add(productToProductResponse(product));
        }
        return productResponseList;
    }

    public static InvoiceResponse invoiceToInvoiceResponse(Invoice invoice) {
        InvoiceResponse invoiceResponse = new InvoiceResponse();
        invoiceResponse.setId(invoice.getId());
        invoiceResponse.setSerial(invoice.getSerial());
        invoiceResponse.setBuyer(companyToCompanyResponse(invoice.getBuyer()));
        invoiceResponse.setSeller(companyToCompanyResponse(invoice.getSeller()));
        invoiceResponse.setProducts(productListToProductResponse(invoice.getProducts()));
        invoiceResponse.setIssueDate(invoice.getIssueDate());
        invoiceResponse.setIssuedBy(invoice.getIssuedBy());
        invoiceResponse.setContactInfo(invoice.getContactInfo());
        invoiceResponse.setCreatedAt(invoice.getCreatedAt());
        invoiceResponse.setUpdatedAt(invoice.getUpdatedAt());
        return invoiceResponse;
    }
}
