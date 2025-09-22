import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReceiptById, updateReceiptProducts } from "../services/api";
import ReceiptProductsForm from "./ReceiptProductsForm";

export default function ReceiptEdit() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getReceiptById(id)
      .then(res => {
        const data = res.data;
        const products = data.products.map(p => ({
          id: p.id,
          name: p.product,
          price: parseFloat(p.price),
          category: p.category || "" 
        }));

        setReceipt({
          id: data.receiptId,
          fileName: data.fileName,
          products,
          imageData: data.imageData // base64 string
        });
        console.log("Loaded receiptId:", data.receiptId);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (updatedProducts) => {
    if (!receipt) return;

    try {
      const payload = updatedProducts.map(p => ({
        id: p.id,
        product: p.name,
        price: parseFloat(p.price),
        category: p.category
      }));

      await updateReceiptProducts(receipt.id, payload);
      alert("Успешно ажурирана сметка!");
      setReceipt(prev => ({ ...prev, products: updatedProducts }));
    } catch (err) {
      console.error("Failed to update receipt:", err.response?.data || err);
      alert("Неуспешно ажурирање!");
    }
  };

  if (loading || !receipt) return <div>Loading...</div>;

  return (
    <div className="container my-4">
      <h3 className="mb-4">Ажурирајте сметка: {receipt.fileName}</h3>

      <div className="row">
        <div className="col-md-4">
          {receipt.imageData ? (
            <img
              src={`data:image/jpeg;base64,${receipt.imageData}`}
              alt={receipt.fileName}
              className="img-fluid border rounded"
              style={{ maxHeight: "500px" }}
            />
          ) : (
            <div className="border rounded p-5 text-muted">
              Не постои слика
            </div>
          )}
        </div>
        <div className="col-md-8">
          <ReceiptProductsForm
              receiptId={receipt.id}
              initialProducts={receipt.products}
              onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
