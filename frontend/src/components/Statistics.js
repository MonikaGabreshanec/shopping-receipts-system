import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#FFBB28"];

export default function Statistics({ receipts, activeTab, selectedDate, selectedMonth }) {
  const [chartTab, setChartTab] = useState("Bar");

  // Filter receipts according to the active tab
  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter(r => {
      const d = new Date(r.uploadedAt);
      if (activeTab === "Дневни" && selectedDate) {
        const [y, m, day] = selectedDate.split("-").map(Number);
        return d.getFullYear() === y && d.getMonth() + 1 === m && d.getDate() === day;
      }
      if (activeTab === "Месечни" && selectedMonth) {
        const [y, m] = selectedMonth.split("-").map(Number);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      }
      return true; // Сите
    });
  }, [receipts, activeTab, selectedDate, selectedMonth]);

  // Category totals
  const categoryData = useMemo(() => {
    const totals = {};
    filteredReceipts.forEach(r => {
      r.products.forEach(p => {
        totals[p.category] = (totals[p.category] || 0) + parseFloat(p.price);
      });
    });
    return Object.entries(totals).map(([category, total]) => ({ category, total }));
  }, [filteredReceipts]);

  // Line chart data
  const lineData = useMemo(() => {
    const totalsByDate = {};
    filteredReceipts.forEach(r => {
      const key = new Date(r.uploadedAt).toLocaleDateString("en-CA");
      if (!totalsByDate[key]) totalsByDate[key] = 0;
      r.products.forEach(p => totalsByDate[key] += parseFloat(p.price));
    });
    return Object.entries(totalsByDate).map(([date, total]) => ({ date, total }));
  }, [filteredReceipts]);

  // Fallback empty chart data (prevents ResponsiveContainer crash)
  const emptyData = [{ name: "", total: 0 }];

  return (
    <div style={{ width: "100%", minHeight: 300 }}>
      <div className="mb-2">
        {["Bar", "Pie", "Line"].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm me-2 ${chartTab === tab ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setChartTab(tab)}
          >
            {tab} Chart
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartTab === "Bar" ? (
          <BarChart data={categoryData.length > 0 ? categoryData : emptyData}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        ) : chartTab === "Pie" ? (
          <PieChart>
            <Pie
              data={categoryData.length > 0 ? categoryData : emptyData}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {(categoryData.length > 0 ? categoryData : emptyData).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <LineChart data={lineData.length > 0 ? lineData : emptyData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#ff7300" />
          </LineChart>
        )}
      </ResponsiveContainer>

      {filteredReceipts.length === 0 && (
        <p className="text-muted mt-2 text-center">Нема достапни податоци за статистика.</p>
      )}
    </div>
  );
}
