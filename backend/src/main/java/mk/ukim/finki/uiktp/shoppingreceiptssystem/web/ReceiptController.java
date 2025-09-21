package mk.ukim.finki.uiktp.shoppingreceiptssystem.web;

import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Receipt;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.ReceiptProduct;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.User;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.repository.UserRepository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    @Autowired
    private UserRepository userRepository;

    // Helper to get the logged-in user
    private User getLoggedInUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

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
        User user = getLoggedInUser();
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
        User user = getLoggedInUser();
        if (!receipt.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build(); // Forbidden
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
                    prodMap.put("category", p.getCategory());
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

        User user = getLoggedInUser();
        if (!receipt.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        receipt.getProducts().clear();

        updatedProducts.forEach(p -> {
            ReceiptProduct rp = new ReceiptProduct(
                    p.getProduct(),
                    p.getPrice(),
                    p.getCategory(), // make sure category is included
                    receipt
            );
            receipt.addProduct(rp);
        });

        Receipt saved = receiptService.save(receipt);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceipt(@PathVariable Long id) {
        Receipt receipt = receiptService.findById(id);
        if (receipt == null) {
            return ResponseEntity.notFound().build();
        }

        User user = getLoggedInUser();
        if (!receipt.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        receiptService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
