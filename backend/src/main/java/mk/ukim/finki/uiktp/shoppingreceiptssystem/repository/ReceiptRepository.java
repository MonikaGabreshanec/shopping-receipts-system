package mk.ukim.finki.uiktp.shoppingreceiptssystem.repository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Receipt;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByUser(User user);
}
