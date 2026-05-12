import React, { useState, useMemo, useRef } from 'react';

interface Reservation {
  id: number;
  kitchen: string;
  startTime: string;
  endTime: string;
}

interface Photo {
  id: number;
}

interface Submission {
  id: number;
  reservation_id: number;
  comment: string;
  photos: Photo[];
}

interface Props {
  reservations: Reservation[];
  submissions: Submission[];
}

function getCsrfToken(): string {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

function formatReservation(r: Reservation): string {
  const start = new Date(r.startTime);
  const end   = new Date(r.endTime);
  const date  = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const fmt   = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });
  return `${r.kitchen} — ${date}, ${fmt(start)}–${fmt(end)}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type StatusKind = 'success' | 'error' | 'info' | null;

// Renders a list of pending files with individual remove buttons.
const FileList: React.FC<{
  files: File[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}> = ({ files, onRemove, disabled }) => {
  if (files.length === 0) return null;
  return (
    <ul className="photo-submission__file-list">
      {files.map((f, i) => (
        <li key={i} className="photo-submission__file-item">
          <span className="photo-submission__file-name">{f.name}</span>
          <span className="photo-submission__file-size">{formatBytes(f.size)}</span>
          <button
            type="button"
            className="photo-submission__file-remove"
            onClick={() => onRemove(i)}
            disabled={disabled}
            aria-label={`Remove ${f.name}`}
          >×</button>
        </li>
      ))}
    </ul>
  );
};

const StudentUpload: React.FC<Props> = ({ reservations, submissions: initialSubmissions }) => {
  const [selectedId,     setSelectedId]     = useState<number | ''>('');
  const [submissions,    setSubmissions]    = useState<Submission[]>(initialSubmissions);
  const [comment,        setComment]        = useState('');
  const [statusMsg,      setStatusMsg]      = useState('');
  const [statusKind,     setStatusKind]     = useState<StatusKind>(null);
  const [uploading,      setUploading]      = useState(false);

  // Pending file lists — controlled outside the <input> so items can be removed
  const [pendingNewFiles, setPendingNewFiles] = useState<File[]>([]);
  const [pendingAddFiles, setPendingAddFiles] = useState<File[]>([]);

  const newFileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const submission = useMemo(
    () => submissions.find(s => s.reservation_id === selectedId) ?? null,
    [submissions, selectedId]
  );

  function setStatus(msg: string, kind: StatusKind) {
    setStatusMsg(msg);
    setStatusKind(kind);
  }

  function handleSelectReservation(id: number | '') {
    setSelectedId(id);
    setStatusMsg('');
    setStatusKind(null);
    setPendingNewFiles([]);
    setPendingAddFiles([]);
    const sub = id !== '' ? submissions.find(s => s.reservation_id === id) : null;
    setComment(sub?.comment ?? '');
  }

  function appendFiles(existing: File[], incoming: File[]): File[] {
    const names = new Set(existing.map(f => f.name));
    const added = incoming.filter(f => !names.has(f.name));
    return [...existing, ...added];
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedId === '') return;
    if (pendingNewFiles.length === 0) {
      setStatus('Please attach at least one photo.', 'error');
      return;
    }

    setUploading(true);
    setStatus('Submitting…', 'info');

    const fd = new FormData();
    fd.append('reservation_id', String(selectedId));
    fd.append('comment', comment);
    pendingNewFiles.forEach(f => fd.append('photos[]', f));

    try {
      const res  = await fetch('/photos', { method: 'POST', headers: { 'X-CSRF-Token': getCsrfToken() }, body: fd });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(prev => [...prev, data]);
        setComment(data.comment ?? '');
        setPendingNewFiles([]);
        setStatus('Submission created!', 'success');
      } else {
        setStatus(`Error: ${(data.errors ?? [data.error]).join(', ')}`, 'error');
      }
    } catch {
      setStatus('Network error. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveComment() {
    if (!submission) return;
    setUploading(true);
    setStatus('Saving…', 'info');

    try {
      const res = await fetch(`/photos/${submission.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
        body:    JSON.stringify({ comment }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, comment } : s));
        setStatus('Comment saved.', 'success');
      } else {
        const data = await res.json();
        setStatus(data.error || 'Failed to save comment.', 'error');
      }
    } catch {
      setStatus('Network error.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadAddFiles() {
    if (!submission || pendingAddFiles.length === 0) return;

    setUploading(true);
    setStatus('Uploading…', 'info');

    const newIds: number[] = [];
    try {
      for (const file of pendingAddFiles) {
        const fd  = new FormData();
        fd.append('photo', file);
        const res  = await fetch(`/photos/${submission.id}/images`, { method: 'POST', headers: { 'X-CSRF-Token': getCsrfToken() }, body: fd });
        const data = await res.json();
        if (res.ok) {
          newIds.push(data.id);
        } else {
          setStatus(`Upload failed: ${data.error || 'unknown error'}`, 'error');
          setUploading(false);
          return;
        }
      }
      setSubmissions(prev => prev.map(s =>
        s.id === submission.id ? { ...s, photos: [...s.photos, ...newIds.map(id => ({ id }))] } : s
      ));
      setPendingAddFiles([]);
      if (addFileInputRef.current) addFileInputRef.current.value = '';
      setStatus('Photos added.', 'success');
    } catch {
      setStatus('Network error.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(photoId: number) {
    if (!submission) return;
    setUploading(true);

    try {
      const res = await fetch(`/images/${photoId}`, { method: 'DELETE', headers: { 'X-CSRF-Token': getCsrfToken() } });
      if (res.ok) {
        setSubmissions(prev => prev.map(s =>
          s.id === submission.id ? { ...s, photos: s.photos.filter(p => p.id !== photoId) } : s
        ));
        setStatusMsg('');
      } else {
        const data = await res.json();
        setStatus(data.error || 'Failed to delete photo.', 'error');
      }
    } catch {
      setStatus('Network error.', 'error');
    } finally {
      setUploading(false);
    }
  }

  const statusClass =
    statusKind === 'success' ? 'photo-submission__success' :
    statusKind === 'error'   ? 'photo-submission__error'   :
    'photo-submission__info';

  return (
    <div className="photo-submission">
      <h1 className="photo-submission__title">Kitchen Photo Submission</h1>
      <p className="photo-submission__subtitle">
        Submit photos documenting the condition of the kitchen after your reservation.
      </p>

      {reservations.length === 0 ? (
        <p className="photo-submission__info">You have no past or in-progress reservations.</p>
      ) : (
        <>
          <div className="photo-submission__row">
            <label className="photo-submission__label" htmlFor="reservation-select">
              Select your reservation
            </label>
            <select
              id="reservation-select"
              className="photo-submission__select"
              value={selectedId}
              onChange={e => handleSelectReservation(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">— choose a reservation —</option>
              {reservations.map(r => (
                <option key={r.id} value={r.id}>{formatReservation(r)}</option>
              ))}
            </select>
          </div>

          {selectedId !== '' && !submission && (
            <form className="photo-submission__form" onSubmit={handleCreate}>
              <div className="photo-submission__row">
                <label className="photo-submission__label" htmlFor="new-photos">
                  Photos <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(select one or more)</span>
                </label>
                <input
                  id="new-photos"
                  ref={newFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      const picked = Array.from(e.target.files);
                      e.target.value = '';
                      setPendingNewFiles(prev => appendFiles(prev, picked));
                    }
                  }}
                />
                <FileList
                  files={pendingNewFiles}
                  onRemove={i => setPendingNewFiles(prev => prev.filter((_, idx) => idx !== i))}
                  disabled={uploading}
                />
              </div>
              <div className="photo-submission__row">
                <label className="photo-submission__label" htmlFor="new-comment">
                  Comment <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  id="new-comment"
                  className="photo-submission__textarea"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <button type="submit" className="photo-submission__btn" disabled={uploading || pendingNewFiles.length === 0}>
                  Submit
                </button>
              </div>
            </form>
          )}

          {submission && (
            <div className="photo-submission__edit">
              <h2 className="photo-submission__section-heading">Your Submission</h2>

              {submission.photos.length > 0 && (
                <div className="photo-submission__photos">
                  {submission.photos.map(p => (
                    <div key={p.id} className="photo-submission__photo">
                      <img src={`/images/${p.id}/file`} alt="Submission photo" />
                      <button
                        className="photo-submission__delete-btn"
                        onClick={() => handleDeletePhoto(p.id)}
                        disabled={uploading}
                        aria-label="Remove photo"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="photo-submission__row">
                <label className="photo-submission__label" htmlFor="add-photos">
                  Add more photos
                </label>
                <input
                  id="add-photos"
                  ref={addFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      const picked = Array.from(e.target.files);
                      e.target.value = '';
                      setPendingAddFiles(prev => appendFiles(prev, picked));
                    }
                  }}
                />
                <FileList
                  files={pendingAddFiles}
                  onRemove={i => setPendingAddFiles(prev => prev.filter((_, idx) => idx !== i))}
                  disabled={uploading}
                />
                {pendingAddFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="photo-submission__btn"
                      onClick={handleUploadAddFiles}
                      disabled={uploading}
                    >
                      Upload {pendingAddFiles.length} photo{pendingAddFiles.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>

              <div className="photo-submission__row">
                <label className="photo-submission__label" htmlFor="edit-comment">Comment</label>
                <textarea
                  id="edit-comment"
                  className="photo-submission__textarea"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <button
                  className="photo-submission__btn"
                  onClick={handleSaveComment}
                  disabled={uploading}
                >
                  Save Comment
                </button>
              </div>
            </div>
          )}

          {statusMsg && <p className={statusClass}>{statusMsg}</p>}
        </>
      )}
    </div>
  );
};

export default StudentUpload;
