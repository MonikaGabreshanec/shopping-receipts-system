package mk.ukim.finki.uiktp.shoppingreceiptssystem.web;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.ReceiptProduct;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.ReceiptProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receipt-products")
@CrossOrigin(origins = "*")
public class ReceiptProductController {
    private final ReceiptProductService productService;

    @Autowired
    public ReceiptProductController(ReceiptProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/receipt/{receiptId}")
    public List<ReceiptProduct> getByReceipt(@PathVariable Long receiptId) {
        return productService.findAllByReceiptId(receiptId);
    }

    @PostMapping
    public ReceiptProduct create(@RequestBody ReceiptProduct product) {
        return productService.create(product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
