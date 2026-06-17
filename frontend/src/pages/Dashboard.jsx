import { useEffect, useState } from "react";
import { fetchRecordsPage } from "../services/api";
import { logFrontendEvent } from "../services/logger";
import UploadSection from "../components/UploadSection";
import RecordTable from "../components/RecordTable";
import Pagination from "../components/Pagination";

export default function Dashboard() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadRecords = (page) => {
        setLoading(true);
        setError(null);
        logFrontendEvent("FETCH_RECORDS_START", { page });

        fetchRecordsPage(page)
            .then((res) => {
                setRecords(res.data.data);
                setTotalPages(res.data.totalPages);
                setCurrentPage(res.data.page);
                logFrontendEvent("FETCH_SUCCESS", { count: res.data.data.length });
            })
            .catch((err) => {
                setError("Failed to fetch student records. Is the backend running?");
                logFrontendEvent("FETCH_ERROR", { error: err.message });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadRecords(currentPage);
    }, [currentPage]);

    return (
        <div className="container">
            <div className="header-controls">
                <h1>Campus Evaluation Dashboard</h1>
                <UploadSection onUploadSuccess={() => loadRecords(1)} />
            </div>

            {loading && <div className="loading">Loading data...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && (
                <>
                    <RecordTable records={records} />
                    {records.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}