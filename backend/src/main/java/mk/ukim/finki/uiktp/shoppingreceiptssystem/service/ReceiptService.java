package mk.ukim.finki.uiktp.shoppingreceiptssystem.service;

import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Receipt;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
public interface ReceiptService {
    Map<String, Object> uploadAndProcess(MultipartFile file) throws IOException, InterruptedException;
    List<Receipt> findAll();

    Receipt findById(Long id);
    Receipt save(Receipt receipt);

}
