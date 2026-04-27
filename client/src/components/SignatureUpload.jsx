import { useRef, useState, useEffect } from 'react';
import {
  Box, Button, Typography, Tabs, Tab, CircularProgress
} from '@mui/material';
import DrawIcon from '@mui/icons-material/Draw';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

export default function SignatureUpload({ onSaved }) {
  const canvasRef          = useRef(null);
  const [drawing, setDrawing]     = useState(false);
  const [tab, setTab]             = useState(0);       // 0 = draw, 1 = upload
  const [status, setStatus]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [currentSig, setCurrentSig] = useState(null); // existing signature URL

  // Load existing signature on mount
  useEffect(() => {
    async function loadSig() {
      const res  = await fetch('http://localhost:5000/api/signature', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data?.signature?.url) setCurrentSig(data.signature.url);
    }
    loadSig();
  }, []);

  // ── Canvas drawing ──────────────────────────────────────────────────
  function startDraw(e) {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  }

  function draw(e) {
    if (!drawing) return;
    const ctx       = canvasRef.current.getContext('2d');
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.strokeStyle = '#1E293B';
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  function stopDraw() { setDrawing(false); }

  function clearCanvas() {
    const c = canvasRef.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
  }

  // ── Upload canvas drawing ───────────────────────────────────────────
  async function uploadCanvas() {
    setLoading(true);
    setStatus('');
    canvasRef.current.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('signature', blob, 'signature.png');
      await sendToServer(formData);
    }, 'image/png');
  }

  // ── Upload image file ───────────────────────────────────────────────
  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('signature', file);
    await sendToServer(formData);
  }

  // ── Shared send function ────────────────────────────────────────────
  async function sendToServer(formData) {
    try {
      const res  = await fetch('http://localhost:5000/api/signature/upload', {
        method:  'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCurrentSig(data.signature.url);
      setStatus('Signature saved successfully!');
      if (onSaved) onSaved(data.signature.url);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Delete signature ────────────────────────────────────────────────
  async function deleteSig() {
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/signature', {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCurrentSig(null);
      setStatus('Signature removed.');
      if (onSaved) onSaved(null);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 460 }}>
      <Typography sx={{
        fontFamily: "'Sora', sans-serif", fontSize: '1rem',
        fontWeight: 700, color: '#0F172A', mb: 2,
      }}>
        Authorised Signature
      </Typography>

      {/* Show current saved signature */}
      {currentSig && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Current Signature
          </Typography>
          <Box sx={{
            border: '1px solid #E2E8F0', borderRadius: '10px',
            p: 1.5, background: '#FAFBFC', display: 'inline-block',
          }}>
            <img src={currentSig} alt="signature"
              style={{ height: 70, maxWidth: 300, objectFit: 'contain', display: 'block' }} />
          </Box>
          <Button
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={deleteSig}
            size="small"
            sx={{
              mt: 1, ml: 0.5, textTransform: 'none', fontSize: '0.775rem',
              color: '#EF4444', fontFamily: "'DM Sans', sans-serif",
              '&:hover': { background: '#FEF2F2' },
            }}
          >
            Remove Signature
          </Button>
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2, minHeight: 36,
          '& .MuiTab-root': {
            textTransform: 'none', fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.825rem', minHeight: 36, fontWeight: 600,
          },
          '& .Mui-selected': { color: '#2563EB' },
          '& .MuiTabs-indicator': { background: '#2563EB' },
        }}
      >
        <Tab icon={<DrawIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Draw" />
        <Tab icon={<UploadFileIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Upload Image" />
      </Tabs>

      {/* Draw Tab */}
      {tab === 0 && (
        <Box>
          <Box sx={{
            border: '1.5px dashed #CBD5E1', borderRadius: '10px',
            overflow: 'hidden', background: '#fff', display: 'inline-block',
          }}>
            <canvas
              ref={canvasRef}
              width={420} height={160}
              style={{ display: 'block', cursor: 'crosshair' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Button
              onClick={clearCanvas}
              size="small"
              sx={{
                textTransform: 'none', fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem', borderRadius: '8px',
                border: '1px solid #E2E8F0', color: '#64748B',
                '&:hover': { background: '#F1F5F9' },
              }}
            >
              Clear
            </Button>
            <Button
              startIcon={loading ? <CircularProgress size={13} /> : <SaveOutlinedIcon fontSize="small" />}
              onClick={uploadCanvas}
              disabled={loading}
              size="small"
              variant="contained"
              sx={{
                textTransform: 'none', fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem', borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              }}
            >
              {loading ? 'Saving...' : 'Save Signature'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Upload Tab */}
      {tab === 1 && (
        <Box>
          <Box sx={{
            border: '1.5px dashed #CBD5E1', borderRadius: '10px',
            p: 3, textAlign: 'center', background: '#FAFBFC',
          }}>
            <UploadFileIcon sx={{ color: '#94A3B8', fontSize: 32, mb: 1 }} />
            <Typography sx={{ fontSize: '0.825rem', color: '#64748B', mb: 1.5 }}>
              Upload a signature image (PNG/JPG)
            </Typography>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{
                textTransform: 'none', fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem', borderRadius: '8px', borderColor: '#CBD5E1',
              }}
            >
              {loading ? 'Uploading...' : 'Choose File'}
              <input type="file" accept="image/*" hidden onChange={uploadFile} />
            </Button>
          </Box>
        </Box>
      )}

      {/* Status message */}
      {status && (
        <Typography sx={{
          mt: 1.5, fontSize: '0.8rem', fontWeight: 600,
          color: status.includes('success') ? '#16A34A' : '#EF4444',
        }}>
          {status}
        </Typography>
      )}
    </Box>
  );
}