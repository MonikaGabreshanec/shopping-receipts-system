import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllReceipts, deleteReceipt } from "../services/api";
import "./ReceiptsList.css";

export default function ReceiptsList() {
    const navigate = useNavigate();

    // Local dates
    const today = new Date();
    const formattedToday = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const formattedMonth = today.toLocaleDateString("en-CA", { year: 'numeric', month: '2-digit' }).slice(0, 7); // YYYY-MM

    const receiptsPerPage = 5;

    const [receipts, setReceipts] = useState([]);
    const [activeTab, setActiveTab] = useState("Дневни");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [selectedDate, setSelectedDate] = useState(formattedToday);
    const [selectedMonth, setSelectedMonth] = useState(formattedMonth);
    const [currentPage, setCurrentPage] = useState({
        "Дневни": 1,
        "Месечни": 1,
        "Сите": 1,
    });

    useEffect(() => {
        getAllReceipts().then((res) => {
            const sorted = res.data.sort(
                (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
            );
            setReceipts(sorted);
        });
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Дали си сигурен/а дека сакаш да ја избришеш фискалната?")) return;
        try {
            await deleteReceipt(id);
            setReceipts(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error("Error deleting receipt:", err);
            alert("Неуспешно бришење!");
        }
    };

    const filteredReceipts = receipts.filter((r) => {
        const uploaded = new Date(r.uploadedAt);

        if (activeTab === "Дневни" && selectedDate) {
            const [year, month, day] = selectedDate.split("-").map(Number);
            return uploaded.getFullYear() === year &&
                   uploaded.getMonth() + 1 === month &&
                   uploaded.getDate() === day;
        }

        if (activeTab === "Месечни" && selectedMonth) {
            const [year, month] = selectedMonth.split("-").map(Number);
            return uploaded.getFullYear() === year &&
                   uploaded.getMonth() + 1 === month;
        }

        if (activeTab === "Сите") {
            const fromDate = dateRange.from ? new Date(dateRange.from) : null;
            const toDate = dateRange.to ? new Date(dateRange.to) : null;

            if (fromDate && uploaded < fromDate) return false;
            if (toDate && uploaded > toDate) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredReceipts.length / receiptsPerPage);
    const page = currentPage[activeTab] || 1;
    const startIndex = (page - 1) * receiptsPerPage;
    const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + receiptsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(prev => ({ ...prev, [activeTab]: newPage }));
    };

    return (
        <div className="receipts-page">
            <div className="container">
                {/* Tabs */}
                <ul className="nav nav-tabs">
                    {["Дневни", "Месечни", "Сите"].map(tab => (
                        <li className="nav-item" key={tab}>
                            <button
                                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                                onClick={() => { setActiveTab(tab); handlePageChange(1); }}
                                type="button"
                            >
                                {tab}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Filters */}
                <div className="mb-3 d-flex gap-3 flex-wrap align-items-end filters-section">
                    {activeTab === "Дневни" && (
                        <div className="d-flex flex-column">
                            <label className="form-label small">Избери ден:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => { setSelectedDate(e.target.value); handlePageChange(1); }}
                                className="form-control form-control-sm"
                                style={{ maxWidth: "150px" }}
                            />
                        </div>
                    )}

                    {activeTab === "Месечни" && (
                        <div className="d-flex flex-column">
                            <label className="form-label small">Избери месец:</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => { setSelectedMonth(e.target.value); handlePageChange(1); }}
                                className="form-control form-control-sm"
                                style={{ maxWidth: "150px" }}
                            />
                        </div>
                    )}

                    {activeTab === "Сите" && (
                        <>
                            <div className="d-flex flex-column">
                                <label className="form-label small">Од:</label>
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => { setDateRange(prev => ({ ...prev, from: e.target.value })); handlePageChange(1); }}
                                    className="form-control form-control-sm"
                                    style={{ maxWidth: "150px" }}
                                />
                            </div>
                            <div className="d-flex flex-column">
                                <label className="form-label small">До:</label>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => { setDateRange(prev => ({ ...prev, to: e.target.value })); handlePageChange(1); }}
                                    className="form-control form-control-sm"
                                    style={{ maxWidth: "150px" }}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Receipts List */}
                <div className="row">
                    <div className="col-md-6">
                        {paginatedReceipts.length === 0 ? (
                            <p className="text-muted">Нема пронајдени сметки.</p>
                        ) : (
                            <ul className="list-group shadow-sm">
                                {paginatedReceipts.map((r) => (
                                    <li key={r.id} className="list-group-item d-flex align-items-center justify-content-between receipt-item">
                                        <div className="d-flex align-items-center gap-3" style={{ cursor: "pointer" }} onClick={() => navigate(`/receipts/${r.id}`)}>
                                            {r.imageData && <img src={`data:image/jpeg;base64,${r.imageData}`} alt={r.fileName} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "5px" }} />}
                                            <div className="d-flex flex-column">
                                                <span>{r.fileName}</span>
                                                <small className="text-muted">{new Date(r.uploadedAt).toLocaleString()}</small>
                                                <span className="fw-semibold">Вкупно: {r.products.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2)} ден</span>
                                            </div>
                                        </div>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash text-danger" style={{ cursor: "pointer" }} viewBox="0 0 16 16" onClick={() => handleDelete(r.id)}>
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                        </svg>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
                                <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Претходно</button>
                                <span>Страница {page} / {totalPages}</span>
                                <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>Следно</button>
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 d-flex align-items-center justify-content-center text-muted">
                        <p>Statistics / Graphs will go here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
