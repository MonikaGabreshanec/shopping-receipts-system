package mk.ukim.finki.uiktp.shoppingreceiptssystem.web;

import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Receipt;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.ReceiptProduct;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
@CrossOrigin(origins = "*")
public class ReceiptController {

    @Autowired
    private ReceiptService receiptService;

    // 1️⃣ Upload a receipt and get extracted products
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadReceipt(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = receiptService.uploadAndProcess(file);

            // Convert image bytes to Base64 string to send to frontend
            byte[] imageData = (byte[]) result.get("imageData");
            if (imageData != null) {
                String base64Image = Base64.getEncoder().encodeToString(imageData);
                result.put("imageData", base64Image);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2️⃣ Get all receipts
    @GetMapping
    public ResponseEntity<List<Receipt>> getAllReceipts() {
        List<Receipt> receipts = receiptService.findAll();
        return ResponseEntity.ok(receipts);
    }

    // 3️⃣ Get a single receipt by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getReceiptById(@PathVariable Long id) {
        Receipt receipt = receiptService.findById(id);
        if (receipt == null) {
            return ResponseEntity.notFound().build();
        }

        // Convert image bytes to Base64 string
        String base64Image = null;
        if (receipt.getImageData() != null) {
            base64Image = Base64.getEncoder().encodeToString(receipt.getImageData());
        }

        // Use HashMap instead of Map.of to allow nulls
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("receiptId", receipt.getId());
        response.put("fileName", receipt.getFileName());
        response.put("uploadedAt", receipt.getUploadedAt());
        response.put("imageData", base64Image);

        // Make sure products list is never null
        List<Map<String, Object>> products = receipt.getProducts() != null
                ? receipt.getProducts().stream()
                .map(p -> {
                    Map<String, Object> prodMap = new java.util.HashMap<>();
                    prodMap.put("id", p.getId());
                    prodMap.put("product", p.getProduct()); // frontend expects "product"
                    prodMap.put("price", p.getPrice());
                    return prodMap;
                })
                .collect(Collectors.toList())
                : java.util.Collections.emptyList();

        response.put("products", products);

        return ResponseEntity.ok(response);
    }


    // 4️⃣ Update products of a receipt (for user corrections)
    @PutMapping("/{id}/products")
    public ResponseEntity<Receipt> updateProducts(
            @PathVariable Long id,
            @RequestBody List<ReceiptProduct> updatedProducts) {

        Receipt receipt = receiptService.findById(id);
        if (receipt == null) {
            return ResponseEntity.notFound().build();
        }

        // Remove existing products and add updated ones
        receipt.getProducts().clear();
        updatedProducts.forEach(receipt::addProduct);

        Receipt saved = receiptService.save(receipt);
        return ResponseEntity.ok(saved);
    }
}
