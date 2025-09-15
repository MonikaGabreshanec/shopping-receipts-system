package mk.ukim.finki.uiktp.shoppingreceiptssystem.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Receipt;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.ReceiptProduct;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.repository.ReceiptRepository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.ReceiptService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ocr.api.url}")
    private String ocrApiUrl;

    public ReceiptServiceImpl(ReceiptRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    @Override
    public Map<String, Object> uploadAndProcess(MultipartFile file) throws IOException, InterruptedException {
        // 1️⃣ Create a new receipt
        Receipt receipt = new Receipt();
        receipt.setFileName(file.getOriginalFilename());
        receipt.setUploadedAt(LocalDateTime.now());
        receipt.setImageData(file.getBytes()); // save the image bytes

        // Save the receipt first to generate an ID
        receiptRepository.save(receipt);

        // 2️⃣ Call the OCR API
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.BodyPublisher body = ofMultipartData(file);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ocrApiUrl))
                .header("Content-Type", "multipart/form-data; boundary=---WebKitFormBoundary7MA4YWxkTrZu0gW")
                .POST(body)
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        // 3️⃣ Deserialize OCR response
        List<Map<String, String>> extractedProducts = objectMapper.readValue(
                response.body(),
                new TypeReference<>() {}
        );

        // 4️⃣ Map OCR products to ReceiptProduct entities
        for (Map<String, String> productMap : extractedProducts) {
            String productName = productMap.get("product"); // get product name
            String priceStr = productMap.get("price");

            if (productName != null && priceStr != null) {
                ReceiptProduct rp = new ReceiptProduct();
                rp.setProduct(productName); // <-- set name correctly
                rp.setPrice(new BigDecimal(priceStr));
                rp.setReceipt(receipt);
                receipt.addProduct(rp);
            }
        }

        // 5️⃣ Save receipt with products
        receiptRepository.save(receipt);

        // 6️⃣ Return result
        Map<String, Object> result = new HashMap<>();
        result.put("receiptId", receipt.getId());
        result.put("fileName", receipt.getFileName());
        result.put("uploadedAt", receipt.getUploadedAt());
        result.put("imageData", receipt.getImageData()); // optional: to send to frontend
        result.put("products", receipt.getProducts());

        return result;
    }



    @Override
    public List<Receipt> findAll() {
        return receiptRepository.findAll();
    }

    @Override
    public Receipt findById(Long id) {
        return receiptRepository.findById(id).orElse(null);
    }
    @Override
    public Receipt save(Receipt receipt) {
        return receiptRepository.save(receipt);
    }


    private HttpRequest.BodyPublisher ofMultipartData(MultipartFile file) throws IOException {
        String boundary = "---WebKitFormBoundary7MA4YWxkTrZu0gW";
        var byteArrays = new ArrayList<byte[]>();

        byteArrays.add(("--" + boundary + "\r\n").getBytes());
        byteArrays.add(("Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getOriginalFilename() + "\"\r\n").getBytes());
        byteArrays.add(("Content-Type: " + file.getContentType() + "\r\n\r\n").getBytes());
        byteArrays.add(file.getBytes());
        byteArrays.add(("\r\n--" + boundary + "--\r\n").getBytes());

        return HttpRequest.BodyPublishers.ofByteArrays(byteArrays);
    }
}
