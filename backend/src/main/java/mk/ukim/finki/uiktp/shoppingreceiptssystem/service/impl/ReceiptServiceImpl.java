package mk.ukim.finki.uiktp.shoppingreceiptssystem.service.impl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Receipt;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.repository.ReceiptRepository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.ReceiptService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
        Receipt receipt = new Receipt();
        receipt.setFileName(file.getOriginalFilename());
        receipt.setUploadedAt(LocalDateTime.now());
        receiptRepository.save(receipt);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.BodyPublisher body = ofMultipartData(file);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ocrApiUrl))
                .header("Content-Type", "multipart/form-data; boundary=---WebKitFormBoundary7MA4YWxkTrZu0gW")
                .POST(body)
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        List<Map<String, String>> extractedProducts = objectMapper.readValue(response.body(), new TypeReference<>() {});

        Map<String, Object> result = new HashMap<>();
        result.put("receiptId", receipt.getId());
        result.put("fileName", file.getOriginalFilename());
        result.put("products", extractedProducts);
        return result;
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
