package mk.ukim.finki.uiktp.shoppingreceiptssystem.repository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
}
