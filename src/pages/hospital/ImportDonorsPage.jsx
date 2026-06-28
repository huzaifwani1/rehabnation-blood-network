import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { BLOOD_TYPES } from '../../data/mockData';

export default function ImportDonorsPage() {
  const { importDonors, showToast } = useAuth();
  const navigate = useNavigate();
  const [csvText, setCsvText] = useState('');
  const [parsedRecords, setParsedRecords] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateRecords = (rawRecords) => {
    const errors = [];
    const valid = [];

    rawRecords.forEach((r, idx) => {
      const rowNum = idx + 1;
      const rowErrors = [];

      if (!r.full_name || !r.full_name.trim()) {
        rowErrors.push('Name is required');
      }

      if (!r.phone || !r.phone.trim()) {
        rowErrors.push('Phone number is required');
      } else if (!/^\+?[0-9\s-]{7,15}$/.test(r.phone.trim())) {
        rowErrors.push('Invalid phone number format');
      }

      if (!r.blood_type || !r.blood_type.trim()) {
        rowErrors.push('Blood group is required');
      } else {
        const cleanBlood = r.blood_type.trim().toUpperCase().replace(/\s/g, '');
        if (!BLOOD_TYPES.includes(cleanBlood)) {
          rowErrors.push(`Invalid blood group: "${r.blood_type}"`);
        } else {
          r.blood_type = cleanBlood; // normalize
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, name: r.full_name || 'Unknown', issues: rowErrors });
      } else {
        valid.push(r);
      }
    });

    setValidationErrors(errors);
    setParsedRecords(valid);
  };

  const handleParseText = () => {
    if (!csvText.trim()) {
      showToast('Please paste or upload some CSV data first.', 'error');
      return;
    }

    try {
      const lines = csvText.split('\n');
      const rawRecords = [];
      
      let startIdx = 0;
      const firstLine = lines[0].toLowerCase();
      if (firstLine.includes('name') || firstLine.includes('phone') || firstLine.includes('blood')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',').map(col => col.trim().replace(/^["']|["']$/g, ''));
        if (columns.length < 3) continue;

        rawRecords.push({
          full_name: columns[0],
          phone: columns[1],
          blood_type: columns[2],
          district: columns[3] || '',
          gender: columns[4] || 'male',
          dob: columns[5] || '',
          email: columns[6] || '',
          last_donation_date: columns[7] || '',
          is_available: true
        });
      }

      if (rawRecords.length === 0) {
        showToast('No records found to parse.', 'error');
        return;
      }

      validateRecords(rawRecords);
      setPreviewOpen(true);
    } catch (e) {
      showToast('Parsing failed: ' + e.message, 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (fileExt === 'xlsx' || fileExt === 'xls') {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          
          // Parse as JSON rows
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (rows.length === 0) {
            showToast('Excel sheet is empty.', 'error');
            return;
          }

          let startIdx = 0;
          const firstRow = rows[0].map(c => String(c).toLowerCase());
          const hasHeader = firstRow.some(r => r.includes('name') || r.includes('phone') || r.includes('blood'));
          if (hasHeader) startIdx = 1;

          const rawRecords = [];
          for (let i = startIdx; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            rawRecords.push({
              full_name: String(row[0] || '').trim(),
              phone: String(row[1] || '').trim(),
              blood_type: String(row[2] || '').trim(),
              district: String(row[3] || '').trim(),
              gender: String(row[4] || 'male').toLowerCase().trim(),
              dob: String(row[5] || '').trim(),
              email: String(row[6] || '').trim(),
              last_donation_date: String(row[7] || '').trim(),
              is_available: true
            });
          }

          validateRecords(rawRecords);
          setPreviewOpen(true);
          showToast('Excel file loaded and parsed.', 'success');
        } catch (err) {
          showToast('Failed to read Excel file: ' + err.message, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Treat as CSV text
      reader.onload = (event) => {
        setCsvText(event.target.result);
        showToast('CSV file loaded. Click "Parse Records" to preview.', 'info');
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (parsedRecords.length === 0) {
      showToast('No valid donor records to import.', 'error');
      return;
    }

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
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '0 var(--space-4)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ margin: '0 0 4px' }}>Import Donors in Bulk</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Add multiple donors at once using a CSV/Excel file or pasting formatted rows</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 'var(--space-6)' }}>
        {/* Upload Card */}
        <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 200 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Upload size={22} />
          </div>
          <h4>Upload File</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Select a CSV or Excel (.xlsx, .xls) file</p>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            Choose File
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Column Specs */}
        <div className="card" style={{ padding: 'var(--space-5)', fontSize: '0.8rem' }}>
          <h4 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSpreadsheet size={16} color="var(--red-600)" /> Spreadsheet Format (Columns)
          </h4>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 12px' }}>Make sure your Excel or CSV has the following column order:</p>
          <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--zinc-700)', lineHeight: '1.6' }}>
            <li><strong>Name</strong> (Required)</li>
            <li><strong>Phone Number</strong> (Required, valid format)</li>
            <li><strong>Blood Type</strong> (e.g. A+, O-, AB+) (Required)</li>
            <li><strong>District</strong> (e.g. Srinagar, Budgam)</li>
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
        <textarea
          rows="5"
          className="form-input"
          style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          placeholder="John Doe, +91 9876543210, O+, Srinagar, male, 1990-05-15&#10;Jane Smith, +91 9123456789, AB-, Budgam, female, 1995-10-20"
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={handleParseText}>Parse & Validate</button>
        </div>
      </div>

      {/* Validation Errors & Preview Section */}
      {previewOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 'var(--space-6)' }}>
          {/* Validation Warnings */}
          {validationErrors.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-5)', borderColor: 'var(--red-300)', background: 'rgba(239, 68, 68, 0.02)' }}>
              <h4 style={{ color: 'var(--red-600)', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                <AlertTriangle size={18} /> Validation Errors ({validationErrors.length} rows ignored)
              </h4>
              <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {validationErrors.map((err, i) => (
                  <div key={i} style={{ color: 'var(--zinc-700)' }}>
                    <strong>Row {err.row} ({err.name}):</strong> {err.issues.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import preview */}
          <div className="card animate-slideUp" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>Import Preview</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>{parsedRecords.length} valid records ready to import</p>
              </div>
              <button className="btn btn-primary" onClick={handleImport} disabled={loading || parsedRecords.length === 0}>
                {loading ? 'Importing...' : `Import ${parsedRecords.length} Donors`}
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
        </div>
      )}
    </div>
  );
}
