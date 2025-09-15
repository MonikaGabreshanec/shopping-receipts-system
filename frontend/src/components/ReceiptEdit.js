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
          price: parseFloat(p.price)
        }));

        setReceipt({
          id: data.receiptId,
          fileName: data.fileName,
          products,
          imageData: data.imageData // base64 string
        });
          console.log("Loaded receiptId:", data.receiptId); // check
      })
      
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

const handleSave = async (updatedProducts) => {
  if (!receipt) return;

  try {
    // Send array directly, not wrapped in { products: [...] }
    const payload = updatedProducts.map(p => ({
      id: p.id,
      product: p.name,
      price: parseFloat(p.price)
    }));

    await updateReceiptProducts(receipt.id, payload);
    alert("Receipt updated successfully!");
    setReceipt(prev => ({ ...prev, products: updatedProducts }));
  } catch (err) {
    console.error("Failed to update receipt:", err.response?.data || err);
    alert("Failed to update receipt");
  }
};


  if (loading || !receipt) return <div>Loading...</div>;

  return (
    <div className="container my-4">
      <h3>Edit Receipt: {receipt.fileName}</h3>

      {receipt.imageData && (
        <div className="mb-3">
          <img
            src={`data:image/jpeg;base64,${receipt.imageData}`}
            alt={receipt.fileName}
            className="img-fluid border"
            style={{ maxHeight: "400px" }}
          />
        </div>
      )}

      <ReceiptProductsForm
        receiptId={receipt.id}
                     // <-- important!
        initialProducts={receipt.products}
        onSave={handleSave}
      />
      
    </div>
  );
}
