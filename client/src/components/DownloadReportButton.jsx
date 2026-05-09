// components/DownloadReportButton.jsx
import { useState } from 'react';

export default function DownloadReportButton({ date }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      // defaults to today if no date passed
      const dateStr = date || new Date().toISOString().split('T')[0];

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/daily?date=${dateStr}`, {
        credentials: 'include', // Enable cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to generate report');
      }

      // Trigger browser download
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `sales-report-${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Generating PDF...' : 'Download Daily Report'}
    </button>
  );
}