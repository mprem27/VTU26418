import { useState, useRef } from "react";
import { uploadStudentCSV } from "../services/api";
import { logFrontendEvent } from "../services/logger";

export default function UploadSection({ onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        logFrontendEvent("UPLOAD_CSV_START", { filename: file.name });

        uploadStudentCSV(formData)
            .then((res) => {
                alert(`Upload Successful! Inserted ${res.data.inserted} records.`);
                logFrontendEvent("UPLOAD_CSV_SUCCESS", { inserted: res.data.inserted });
                onUploadSuccess(); // Tell the Dashboard to refresh the table
            })
            .catch((err) => {
                alert("Failed to upload CSV.");
                logFrontendEvent("UPLOAD_CSV_ERROR", { error: err.message });
            })
            .finally(() => {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            });
    };

    return (
        <div className="upload-wrapper">
            <label className={`upload-btn ${uploading ? 'disabled' : ''}`}>
                {uploading ? "Uploading..." : "+ Upload CSV"}
                <input
                    type="file" accept=".csv"
                    onChange={handleFileUpload} disabled={uploading} ref={fileInputRef}
                />
            </label>
        </div>
    );
}