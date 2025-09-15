import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllReceipts } from "../services/api";

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllReceipts().then(res => setReceipts(res.data));
  }, []);

  return (
    <div className="container my-4">
      <h3 className="mb-3">All Receipts</h3>

      <ul className="list-group">
        {receipts.map(r => (
          <li
            key={r.id}
            className="list-group-item d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/receipts/${r.id}`)}
          >
            {r.fileName} - {r.products.length} products
          </li>
        ))}
      </ul>
    </div>
  );
}
