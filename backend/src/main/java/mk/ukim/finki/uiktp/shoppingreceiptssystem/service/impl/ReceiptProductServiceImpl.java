package mk.ukim.finki.uiktp.shoppingreceiptssystem.service.impl;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.ReceiptProduct;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.repository.ReceiptProductRepository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.ReceiptProductService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReceiptProductServiceImpl implements ReceiptProductService{
    private final ReceiptProductRepository productRepository;

    public ReceiptProductServiceImpl(ReceiptProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<ReceiptProduct> findAllByReceiptId(Long receiptId) {
        return productRepository.findByReceiptId(receiptId);
    }

    @Override
    public ReceiptProduct create(ReceiptProduct product) {
        return productRepository.save(product);
    }

    @Override
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
