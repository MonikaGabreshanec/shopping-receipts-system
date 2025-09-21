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
          category: p.category || ""
        }))
      );
      setReceiptId(res.data.receiptId);
    } catch (err) {
      console.error(err);
      alert("Неуспешно поставување на сметка!");
    }
  };

  const handleSave = async (updatedProducts) => {
    if (!receiptId) return;

    try {
      const payload = updatedProducts.map((p) => ({
        id: p.id,
        product: p.name,
        price: parseFloat(p.price),
        category: p.category || "" 
      }));
      await updateReceiptProducts(receiptId, payload);
      alert("Успешно поставена сметка!");
      setProducts(updatedProducts);
    } catch (err) {
      console.error("Failed to update receipt:", err.response?.data || err);
      alert("Неуспешно ажурирање!");
    }
  };

  return (
      <div
          style={{
            minHeight: "100vh",
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
      >
        <div
            style={{
              backgroundColor: "white",
              borderRadius: "30px",
              padding: "40px",
              maxWidth: "1100px",
              width: "100%",
              boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
            }}
        >
          <h3 className="mb-4 text-center" style={{ color: "#111827", fontWeight: 700 }}>
            Поставете сметка
          </h3>

          <div className="input-group mb-4">
            <input type="file" className="form-control" onChange={handleFileChange} />
            <button className="btn btn-primary" onClick={handleUpload}>
              Поставете сметка
            </button>
          </div>

          <div className="row">
            <div className="col-md-4 text-center mb-3">
              {previewUrl ? (
                  <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      className="img-fluid border rounded"
                      style={{ maxHeight: "400px" }}
                  />
              ) : (
                  <div className="border rounded p-5 text-muted">Нема изберена сметка</div>
              )}
            </div>

            <div className="col-md-8">
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
  );
}
