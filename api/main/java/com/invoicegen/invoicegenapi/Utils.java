package com.invoicegen.invoicegenapi;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import com.invoicegen.invoicegenapi.entities.Company;
import com.invoicegen.invoicegenapi.entities.Invoice;
import com.invoicegen.invoicegenapi.entities.Product;
import com.invoicegen.invoicegenapi.entities.User;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;

public abstract class Utils {
    private Utils() {}

    public static final int BITE_SIZE = 4 * 1024;

    public static List<Long> parseStringIdsToLongList(String ids) {
        List<Long> idList = new ArrayList<>();
        for (String id : ids.split(",")) {
            idList.add(Long.parseLong(id));
        }
        return idList;
    }

    public static Float countTotalInvoiceSum(Invoice invoice) {
        Float sum = 0f;
        for (Product product : invoice.getProducts()) {
            Float vatAmount = countVatAmount(product);
            sum += product.getQuantity() * product.getUnitPrice() + vatAmount;
        }
        return Utils.roundFloat(sum,2);
    }

    public static float roundFloat(float number, int scale) {
        int pow = 10;
        for (int i = 1; i < scale; i++)
            pow *= 10;
        float tmp = number * pow;
        return ( (float) ( (int) ((tmp - (int) tmp) >= 0.5f ? tmp + 1 : tmp) ) ) / pow;
    }

    public static float countVatAmount(Product product) {
        Float total = product.getQuantity() * product.getUnitPrice();
        return roundFloat(total * (product.getVatPercent() / 100), 2);
    }

    public static byte[] compressImage(byte[] data) throws IOException {
        Deflater deflater = new Deflater();
        deflater.setLevel(Deflater.BEST_COMPRESSION);
        deflater.setInput(data);
        deflater.finish();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] tmp = new byte[BITE_SIZE];

        while(!deflater.finished()) {
            int size = deflater.deflate(tmp);
            outputStream.write(tmp,0, size);
        }

        outputStream.close();

        return outputStream.toByteArray();
    }

    public static byte[] decompressImage(byte[] data) throws DataFormatException, IOException {
        Inflater inflater = new Inflater();
        inflater.setInput(data);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] tmp = new byte[BITE_SIZE];

        while (!inflater.finished()) {
            int count = inflater.inflate(tmp);
            outputStream.write(tmp, 0, count);
        }

        outputStream.close();

        return outputStream.toByteArray();
    }

    public static User getUserFromSecurityContext() {
        return User.builder()
                .email(SecurityContextHolder.getContext().getAuthentication().getName())
                .build();
    }

    public static String getUserEmailFromSecurityContext() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public static void deleteCompanyIfNoAdditionalInvoices(Company buyer, Company seller, Set<Long> checkedCompanies) {
        if (buyer.getInvoicesBuyer().size() == 1) {
            checkedCompanies.add(buyer.getId());
        }
        if (seller.getInvoicesSeller().size() == 1) {
            checkedCompanies.add(seller.getId());
        }
    }
}
