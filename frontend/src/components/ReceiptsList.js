import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {getAllReceipts, deleteReceipt} from "../services/api";

export default function ReceiptsList() {
    const [groupedReceipts, setGroupedReceipts] = useState({});
    const [filteredReceipts, setFilteredReceipts] = useState({});
    const [currentPage, setCurrentPage] = useState({});
    const [dateRange, setDateRange] = useState({from: "", to: ""});
    const receiptsPerPage = 5;

    const navigate = useNavigate();

    useEffect(() => {
        getAllReceipts().then(res => {
            const receipts = res.data;

            const now = new Date();
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

            const groups = {
                Today: [],
                "This Week": [],
                Older: []
            };

            receipts.forEach(r => {
                const uploaded = new Date(r.uploadedAt);
                if (uploaded >= startOfToday) {
                    groups.Today.push(r);
                } else if (uploaded >= startOfWeek) {
                    groups["This Week"].push(r);
                } else {
                    groups.Older.push(r);
                }
            });

            setGroupedReceipts(groups);
            setFilteredReceipts(groups);
            const initPages = {};
            Object.keys(groups).forEach(k => (initPages[k] = 1));
            setCurrentPage(initPages);
        });
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Дали си сигурен/а дека сакаш да ја избришеш фискалната?")) return;
        try {
            await deleteReceipt(id);
            setFilteredReceipts(prev => {
                const newGroups = {...prev};
                for (const key in newGroups) {
                    newGroups[key] = newGroups[key].filter(r => r.id !== id);
                }
                return newGroups;
            });
        } catch (err) {
            console.error("Error deleting receipt:", err);
            alert("Неуспешно бришење!");
        }
    };

    const handleDateRangeChange = (field, value) => {
        const newRange = {...dateRange, [field]: value};
        setDateRange(newRange);

        if (!newRange.from && !newRange.to) {
            setFilteredReceipts(groupedReceipts);
            return;
        }

        const fromDate = newRange.from ? new Date(newRange.from) : null;
        const toDate = newRange.to ? new Date(newRange.to) : null;

        const filtered = {};
        for (const [label, receipts] of Object.entries(groupedReceipts)) {
            filtered[label] = receipts.filter(r => {
                const uploaded = new Date(r.uploadedAt);
                if (fromDate && uploaded < fromDate) return false;
                if (toDate && uploaded > toDate) return false;
                return true;
            });
        }
        setFilteredReceipts(filtered);
    };

    return (
        <div className="container my-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <h3 className="mb-0">All Receipts</h3>
                <div className="d-flex gap-2">
                    <div>
                        <label className="form-label mb-0 small">From:</label>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => handleDateRangeChange("from", e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div>
                        <label className="form-label mb-0 small">To:</label>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => handleDateRangeChange("to", e.target.value)}
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            {Object.entries(filteredReceipts).map(([label, receipts]) => {
                if (receipts.length === 0) return null;

                const page = currentPage[label] || 1;
                const startIndex = (page - 1) * receiptsPerPage;
                const paginated = receipts.slice(startIndex, startIndex + receiptsPerPage);
                const totalPages = Math.ceil(receipts.length / receiptsPerPage);

                return (
                    <div key={label} className="mb-5">
                        <h4 className="mb-3">{label}</h4>
                        <div className="row g-4">
                            {paginated.map((r) => (
                                <div key={r.id} className="col-sm-6 col-md-4 col-lg-3">
                                    <div className="card h-100 shadow-sm">
                                        <div className="row g-0 h-100">
                                            {r.imageData && (
                                                <div
                                                    className="col-12 d-flex justify-content-center align-items-center p-2"
                                                    style={{cursor: "pointer"}}
                                                    onClick={() => navigate(`/receipts/${r.id}`)}
                                                >
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
                                            )}

                                            <div className="col-12">
                                                <div className="card-body text-center">
                                                    <h5 className="card-title mb-2">{r.fileName}</h5>
                                                    <p className="card-text text-muted mb-2">
                                                        {r.products.length} products
                                                    </p>
                                                    <p className="fw-bold">
                                                        Total: {r.products.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2)} ден
                                                    </p>
                                                    <small className="text-muted">
                                                        Uploaded: {new Date(r.uploadedAt).toLocaleString()}
                                                    </small>
                                                    <br/>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger mt-2"
                                                        onClick={() => handleDelete(r.id)}
                                                    >
                                                        🗑 Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={page === 1}
                                    onClick={() =>
                                        setCurrentPage(prev => ({
                                            ...prev,
                                            [label]: page - 1
                                        }))
                                    }
                                >
                                    Претходно
                                </button>
                                <span>
                                    Страница {page} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={page === totalPages}
                                    onClick={() =>
                                        setCurrentPage(prev => ({
                                            ...prev,
                                            [label]: page + 1
                                        }))
                                    }
                                >
                                    Следно
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
