package com.invoicegen.invoicegenapi;

import com.invoicegen.invoicegenapi.entities.Invoice;
import com.invoicegen.invoicegenapi.entities.Product;

import java.util.ArrayList;
import java.util.List;

public abstract class Utils {
    private Utils() {}

    public static List<Long> parseStringIdsToLongList(String ids) {
        List<Long> idList = new ArrayList<>();
        for (String id : ids.split(",")) {
            idList.add(Long.parseLong(id));
        }
        return idList;
    }

    public static Float countTotalSum(Invoice invoice) {
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
}
