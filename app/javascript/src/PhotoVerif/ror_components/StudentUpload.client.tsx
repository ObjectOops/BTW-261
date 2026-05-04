import React, { useState } from 'react';

const StudentUpload = () => {
  const [netIds, setNetIds] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!photo || !netIds) return;

    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('net_ids', netIds);
    formData.append('photo', photo);

    // Grab the CSRF token Rails puts in the document head
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    try {
      const response = await fetch('/photo_submissions', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body: formData,
      });

      if (response.ok) {
        setStatus('Upload successful!');
        setNetIds('');
        setPhoto(null);
      } else {
        // Attempt to parse the exact error from the server
        const data = await response.json().catch(() => null);
        console.error("Server rejected the upload:", data);
        
        if (data && data.errors) {
          setStatus(`Upload failed: ${data.errors.join(', ')}`);
        } else {
          setStatus('Upload failed: Server returned a 422 error. Check Rails terminal.');
        }
      }
    } catch (error) {
      setStatus('An error occurred while communicating with the server.');
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Kitchen Photo Verification</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Names / NetIDs (comma separated):</label>
          <input 
            type="text" 
            value={netIds} 
            onChange={(e) => setNetIds(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Photo:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            required 
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Submit Photo</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default StudentUpload;