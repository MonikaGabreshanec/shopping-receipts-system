import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const uploadReceipt = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_URL}/receipts/upload`, formData);
};

export const getAllReceipts = () => axios.get(`${API_URL}/receipts`);

export const getReceiptById = (id) => axios.get(`${API_URL}/receipts/${id}`);

export const updateReceiptProducts = (id, products) =>
  axios.put(`${API_URL}/receipts/${id}/products`, products);
