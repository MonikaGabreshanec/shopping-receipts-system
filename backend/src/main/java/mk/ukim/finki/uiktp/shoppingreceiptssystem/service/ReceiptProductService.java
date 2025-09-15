package mk.ukim.finki.uiktp.shoppingreceiptssystem.service;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.ReceiptProduct;

import java.util.List;
public interface ReceiptProductService {
    List<ReceiptProduct> findAllByReceiptId(Long receiptId);
    ReceiptProduct create(ReceiptProduct product);
    void delete(Long id);
}
