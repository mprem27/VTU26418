export default function RecordTable({ records }) {
    if (records.length === 0) {
        return <div className="empty">No student records found. Upload a CSV to get started!</div>;
    }

    return (
        <div className="table-wrapper">
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id || "N/A"}</td>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}