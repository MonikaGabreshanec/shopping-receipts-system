import { useState } from "react";
import { uploadReceipt } from "../services/api";
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
  if (!file) return alert("Select a file first!");

  // Reset state before uploading
  setProducts([]);
  setReceiptId(null);

  try {
    const res = await uploadReceipt(file);
    setProducts(res.data.products.map(p => ({ ...p, price: parseFloat(p.price) })));
    setReceiptId(res.data.receiptId);
  } catch (err) {
    console.error(err);
    alert("Failed to upload receipt");
  }
};


  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Upload Receipt</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>

          {previewUrl && (
            <div className="mb-3 text-center">
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="img-fluid border"
                style={{ maxHeight: "400px" }}
              />
            </div>
          )}

          <div className="d-grid gap-2">
            <button className="btn btn-success" onClick={handleUpload}>
              Upload Receipt
            </button>
          </div>
        </div>
      </div>

      {products.length > 0 && receiptId && (
        <div className="mt-4">
          <ReceiptProductsForm
            receiptId={receiptId}
            initialProducts={products}
          />
        </div>
      )}
    </div>
  );
}
