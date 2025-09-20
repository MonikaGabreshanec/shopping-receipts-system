import axios from "axios";

const API_URL = "http://localhost:8080/api";

// helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
};

export const uploadReceipt = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_URL}/receipts/upload`, formData, { headers: getAuthHeader() });
};

export const getAllReceipts = () =>
  axios.get(`${API_URL}/receipts`, { headers: getAuthHeader() });
console.log(getAuthHeader())

export const getReceiptById = (id) =>
  axios.get(`${API_URL}/receipts/${id}`, { headers: getAuthHeader() });

export const updateReceiptProducts = (id, products) =>
  axios.put(`${API_URL}/receipts/${id}/products`, products, { headers: getAuthHeader() });

export const deleteReceipt = (id) =>
  axios.delete(`${API_URL}/receipts/${id}`, { headers: getAuthHeader() });
