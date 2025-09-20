package mk.ukim.finki.uiktp.shoppingreceiptssystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    private LocalDateTime uploadedAt;

    @Lob
    @Column(name = "image_data")
    private byte[] imageData; // store the image bytes

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReceiptProduct> products = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    private BigDecimal total = BigDecimal.ZERO;

    public Receipt() {
        this.uploadedAt = LocalDateTime.now();
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public List<ReceiptProduct> getProducts() { return products; }
    public void setProducts(List<ReceiptProduct> products) { this.products = products; }

    public void addProduct(ReceiptProduct product) {
        products.add(product);
        product.setReceipt(this);
        if (product.getPrice() != null) {
            this.total = this.total.add(product.getPrice());
        }
    }

    public void removeProduct(ReceiptProduct product) {
        products.remove(product);
        product.setReceipt(null);
    }
}
