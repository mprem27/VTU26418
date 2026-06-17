import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchRecordsPage = (page) => {
    return axios.get(`${API_BASE}/records/page?page=${page}`);
};

export const uploadStudentCSV = (formData) => {
    return axios.post(`${API_BASE}/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};