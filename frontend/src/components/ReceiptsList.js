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

      <div className="row g-4">
        {receipts.map((r) => (
          <div
            key={r.id}
            className="col-sm-6 col-md-3"
            onClick={() => navigate(`/receipts/${r.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="card h-100 shadow-sm" style={{ minHeight: "300px" }}>
              <div className="row g-0 h-100">
                {/* Image section */}
                {r.imageData ? (
                  <div className="col-12 d-flex justify-content-center align-items-center p-2">
                    <img
                      src={`data:image/jpeg;base64,${r.imageData}`}
                      alt={r.fileName}
                      className="img-fluid rounded"
                      style={{
                        maxHeight: "200px",
                        width: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                ) : null}

                {/* Info section */}
                <div className="col-12">
                  <div className="card-body text-center">
                    <h5 className="card-title mb-2">{r.fileName}</h5>
                    <p className="card-text text-muted mb-0">
                      {r.products.length} products
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
