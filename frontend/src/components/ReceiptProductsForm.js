import { useState, useEffect } from "react";

const CATEGORIES = ["Храна", "Пијалоци", "Козметика", "Хигиена", "Домаќинство", "Електроника", "Друго"];

export default function ReceiptProductsForm({ receiptId, initialProducts, onSave }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (initialProducts) {
            const mapped = initialProducts.map(p => ({
                id: p.id,
                name: p.name ?? p.product,
                price: parseFloat(p.price),
                category: p.category || ""
            }));
            console.log(mapped);  // <-- check here
            setProducts(mapped);
        }
    }, [initialProducts]);

    const handleChange = (index, field, value) => {
        const updated = [...products];
        updated[index][field] = value;
        setProducts(updated);
    };

    const handleAddProduct = () => setProducts([...products, { name: "", price: 0 }]);

    const handleRemoveProduct = (index) => {
        const updated = products.filter((_, i) => i !== index);
        setProducts(updated);
    };

    const handleSave = async () => {
        if (!receiptId) return alert("Receipt ID is missing");

        try {
            if (onSave) onSave(products);
            alert("Производите се успешно зачувани!");
        } catch {
            alert("Неуспешно зачувување на производите!");
        }
    };

    return (
        <div className="card p-3 shadow-sm">
            <h4>Ажурирај призводи</h4>

            {products.map((p, index) => (
                <div key={index} className="row align-items-center mb-2">
                    {/* Product Name - wider */}
                    <div className="col-md-7 mb-1">
                        <input
                            type="text"
                            className="form-control"
                            value={p.name}
                            onChange={(e) => handleChange(index, "name", e.target.value)}
                            placeholder="Име на продукт"
                        />
                    </div>

                    {/* Price and Trash - smaller, next to each other */}
                    <div className="col-md-5 d-flex gap-2 mb-1 align-items-center">
                        <input
                            type="number"
                            className="form-control"
                            value={p.price}
                            onChange={(e) =>
                                handleChange(index, "price", e.target.value ? parseFloat(e.target.value) : 0)
                            }
                            placeholder="Цена"
                            step="0.01"
                            style={{ maxWidth: "80px" }}
                        />

                        {/* Category dropdown */}
                        <select
                            className="form-control"
                            value={p.category}
                            onChange={(e) => handleChange(index, "category", e.target.value)}
                            style={{ maxWidth: "125px" }}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-trash text-danger"
                            style={{ cursor: "pointer" }}
                            viewBox="0 0 16 16"
                            onClick={() => handleRemoveProduct(index)}
                        >
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1H14a1 1 0 0 1 1 1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3h11V2h-11z" />
                        </svg>
                    </div>
                </div>
            ))}

            <div className="mt-3">
                <strong>
                    Вкупно: {products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0).toFixed(2)} ден
                </strong>
            </div>

            <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" onClick={handleAddProduct}>Додадете производ</button>
                <button className="btn btn-success" onClick={handleSave}>Зачувај</button>
            </div>
        </div>
    );
}
