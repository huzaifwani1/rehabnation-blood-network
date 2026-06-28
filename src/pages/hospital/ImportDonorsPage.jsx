import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ImportDonorsPage() {
  const { importDonors, showToast } = useAuth();
  const navigate = useNavigate();
  const [csvText, setCsvText] = useState('');
  const [parsedRecords, setParsedRecords] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleParseText = () => {
    if (!csvText.trim()) {
      showToast('Please paste or upload some CSV data first.', 'error');
      return;
    }

    try {
      const lines = csvText.split('\n');
      const records = [];
      
      // Assume header line exists or check if first line is header
      let startIdx = 0;
      const firstLine = lines[0].toLowerCase();
      if (firstLine.includes('name') || firstLine.includes('phone') || firstLine.includes('blood')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV splitting
        const columns = line.split(',').map(col => col.trim().replace(/^["']|["']$/g, ''));
        if (columns.length < 3) continue;

        records.push({
          full_name: columns[0],
          phone: columns[1],
          blood_type: columns[2],
          district: columns[3] || '',
          gender: columns[4] || 'male',
          dob: columns[5] || '',
          email: columns[6] || '',
          last_donation_date: columns[7] || ''
        });
      }

      if (records.length === 0) {
        showToast('No valid donor records could be parsed. Verify the CSV format.', 'error');
        return;
      }

      setParsedRecords(records);
      setPreviewOpen(true);
      showToast(`Parsed ${records.length} records successfully! Check the preview below.`, 'success');
    } catch (e) {
      showToast('Parsing failed: ' + e.message, 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
      showToast('CSV file loaded. Click "Parse Records" to preview.', 'info');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRecords.length === 0) return;

    setLoading(true);
    const result = await importDonors(parsedRecords);
    setLoading(false);

    if (result.success) {
      showToast(`Successfully imported ${result.count} donor records!`, 'success');
      navigate('/dashboard');
    } else {
      showToast(result.error || 'Failed to import records', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 var(--space-4)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ margin: '0 0 4px' }}>Import Donors in Bulk</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Add multiple donors at once using a CSV upload or pasting formatted rows</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 'var(--space-6)' }}>
        {/* Upload Card */}
        <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 200 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Upload size={22} />
          </div>
          <h4>Upload CSV File</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Select a comma-separated value (.csv) file</p>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            Choose File
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Format Card */}
        <div className="card" style={{ padding: 'var(--space-5)', fontSize: '0.8rem' }}>
          <h4 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSpreadsheet size={16} color="var(--red-600)" /> Required CSV Columns
          </h4>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 12px' }}>Make sure your data has the following columns (order matters):</p>
          <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--zinc-700)', lineHeight: '1.6' }}>
            <li><strong>Name</strong> (Required)</li>
            <li><strong>Phone Number</strong> (Required)</li>
            <li><strong>Blood Type</strong> (e.g. A+, O-, AB+) (Required)</li>
            <li><strong>District</strong> (Recommended)</li>
            <li><strong>Gender</strong> (male/female/other)</li>
            <li><strong>Date of Birth</strong> (YYYY-MM-DD)</li>
            <li><strong>Email</strong></li>
            <li><strong>Last Donation Date</strong> (YYYY-MM-DD)</li>
          </ol>
        </div>
      </div>

      {/* CSV Paste Textbox */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <h4 style={{ margin: '0 0 8px' }}>Paste CSV Content</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Paste raw text directly (header row optional):</p>
        <textarea
          rows="6"
          className="form-input"
          style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          placeholder="John Doe, +2348012345678, O+, Lagos Island, male, 1990-05-15&#10;Jane Smith, +2348098765432, AB-, Ikeja, female, 1995-10-20"
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={handleParseText}>Parse Records</button>
        </div>
      </div>

      {/* Preview Section */}
      {previewOpen && (
        <div className="card animate-slideUp" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Import Preview ({parsedRecords.length} records)</h3>
            <button className="btn btn-primary" onClick={handleImport} disabled={loading}>
              {loading ? 'Importing...' : 'Confirm Import'}
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Name</th>
                  <th style={{ textAlign: 'left' }}>Phone</th>
                  <th style={{ textAlign: 'left' }}>Blood Type</th>
                  <th style={{ textAlign: 'left' }}>District</th>
                </tr>
              </thead>
              <tbody>
                {parsedRecords.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.full_name}</td>
                    <td>{r.phone}</td>
                    <td>
                      <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '2px 8px', borderRadius: 99, fontWeight: 700, fontSize: '0.78rem' }}>
                        {r.blood_type}
                      </span>
                    </td>
                    <td>{r.district}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
