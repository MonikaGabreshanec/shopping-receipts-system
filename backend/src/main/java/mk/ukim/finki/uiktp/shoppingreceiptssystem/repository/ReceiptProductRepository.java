package mk.ukim.finki.uiktp.shoppingreceiptssystem.repository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.ReceiptProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface ReceiptProductRepository extends JpaRepository<ReceiptProduct, Long> {
    List<ReceiptProduct> findByReceiptId(Long receiptId);
}
