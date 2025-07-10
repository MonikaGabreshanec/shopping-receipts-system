package mk.ukim.finki.uiktp.shoppingreceiptssystem.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
public interface ReceiptService {
    Map<String, Object> uploadAndProcess(MultipartFile file) throws IOException, InterruptedException;
}
