package mk.ukim.finki.uiktp.shoppingreceiptssystem.web;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.ReceiptService;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.impl.ReceiptServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/receipts")
@CrossOrigin(origins = "*")
public class ReceiptController {
    @Autowired
    private ReceiptService receiptService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadReceipt(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = receiptService.uploadAndProcess(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
