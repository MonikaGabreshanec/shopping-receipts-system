import { useState } from "react";
import { uploadReceipt, updateReceiptProducts } from "../services/api";
import ReceiptProductsForm from "./ReceiptProductsForm";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ReceiptUpload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [products, setProducts] = useState([]);
  const [receiptId, setReceiptId] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Reset previous upload data
    setProducts([]);
    setReceiptId(null);

    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Изберете сметка!");

    // Reset state before uploading
    setProducts([]);
    setReceiptId(null);

    try {
      const res = await uploadReceipt(file);
      setProducts(
        res.data.products.map((p) => ({
          id: p.id, // make sure id is included if backend provides it
          name: p.product,
          price: parseFloat(p.price),
        }))
      );
      setReceiptId(res.data.receiptId);
    } catch (err) {
      console.error(err);
      alert("Неуспешно поставување на сметка!");
    }
  };

  // 🔹 Add this: save handler for ReceiptProductsForm
  const handleSave = async (updatedProducts) => {
    if (!receiptId) return;

    try {
      const payload = updatedProducts.map((p) => ({
        id: p.id,
        product: p.name,
        price: parseFloat(p.price),
      }));

      await updateReceiptProducts(receiptId, payload);
      alert("Успешно поставена сметка!");
      setProducts(updatedProducts); // update state with new values
    } catch (err) {
      console.error("Failed to update receipt:", err.response?.data || err);
      alert("Неуспешно ажурирање!");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Поставете сметка</h4>
        </div>
        <div className="card-body">
          {/* File input + button (full width row) */}
          <div className="row">
            <div className="input-group mb-3">
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
              />
              <button className="btn btn-success" onClick={handleUpload}>
                Поставете сметка
              </button>
            </div>
          </div>

          {/* Image on the left, Products form on the right */}
          <div className="row">
            <div className="col-md-6 text-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="img-fluid border rounded"
                  style={{ maxHeight: "500px" }}
                />
              ) : (
                <div className="border rounded p-5 text-muted">
                  Нема изберена сметка
                </div>
              )}
            </div>

            <div className="col-md-6">
              {products.length > 0 && receiptId ? (
                <ReceiptProductsForm
                  receiptId={receiptId}
                  initialProducts={products}
                  onSave={handleSave}   
                />
              ) : (
                <div className="text-muted">
                  Поставете сметка за да ги изменете продуктите
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
