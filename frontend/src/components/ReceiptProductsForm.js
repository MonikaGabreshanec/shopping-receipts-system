import {useState, useEffect} from "react";

export default function ReceiptProductsForm({receiptId, initialProducts, onSave}) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (initialProducts) {
            setProducts(initialProducts.map(p => ({
                id: p.id,
                name: p.name ?? p.product,
                price: parseFloat(p.price)
            })));
        }
    }, [initialProducts]);

    const handleChange = (index, field, value) => {
        const updated = [...products];
        updated[index][field] = value;
        setProducts(updated);
    };

    const handleAddProduct = () => {
        setProducts([...products, {name: "", price: 0}]);
    };

    const handleRemoveProduct = (index) => {
        const updated = products.filter((_, i) => i !== index);
        setProducts(updated);
    };

    const handleSave = async () => {
        if (!receiptId) {
            alert("Receipt ID is missing");
            return;
        }

        try {
            const payload = {
                products: products.map(p => ({
                    id: p.id,
                    product: p.name,
                    price: parseFloat(p.price)
                }))
            };

            if (onSave) onSave(products);
            alert("Products saved successfully!");
        } catch (err) {
            alert("Failed to save products");
        }
    };

    return (
        <div className="card p-3 shadow-sm">
            <h4>Edit Products</h4>
            {products.map((p, index) => (
                <div key={index} className="row align-items-center mb-2">
                    <div className="col-md-6 mb-1">
                        <input
                            type="text"
                            className="form-control"
                            value={p.name}
                            onChange={(e) => handleChange(index, "name", e.target.value)}
                            placeholder="Product name"
                        />
                    </div>
                    <div className="col-md-3 mb-1">
                        <input
                            type="number"
                            className="form-control"
                            value={p.price}
                            onChange={(e) =>
                                handleChange(index, "price", e.target.value ? parseFloat(e.target.value) : 0)
                            }
                            placeholder="Price"
                            step="0.01"
                        />
                    </div>
                    <div className="col-md-3 mb-1">
                        <button
                            className="btn btn-danger w-100"
                            onClick={() => handleRemoveProduct(index)}
                        >
                            Remove
                        </button>
                    </div>
                </div>

            ))}

            <div className="mt-3">
                <strong>
                    Total: {products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0).toFixed(2)} ден
                </strong>
            </div>
            <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" onClick={handleAddProduct}>
                    Add Product
                </button>
                <button className="btn btn-success" onClick={handleSave}>
                    Save Products
                </button>
            </div>
        </div>
    );
}
