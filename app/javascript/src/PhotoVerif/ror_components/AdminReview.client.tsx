import { useState } from 'react';

interface Image {
  id: number;
}

interface Submission {
  id: number;
  net_id: string;
  kitchen: string;
  date: string;
  images: Image[];
}

interface Props {
  initialSubmissions: Submission[];
}

const AdminReview = ({ initialSubmissions }: Props) => {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

  const handleReview = async (id: number) => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const response = await fetch(`/management/photo_reviews/${id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });

    if (response.ok) {
      setSubmissions(submissions.filter(sub => sub.id !== id));
    } else {
      alert('Failed to process review.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Photo Review</h2>
      {submissions.length === 0 ? <p>No photos pending review.</p> : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {submissions.map((sub) => (
          <div key={sub.id} style={{ border: '1px solid #ccc', padding: '1rem', maxWidth: '400px' }}>
            <p><strong>NetID:</strong> {sub.net_id}</p>
            <p><strong>Kitchen:</strong> {sub.kitchen}</p>
            <p><strong>Date:</strong> {sub.date}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {sub.images.map(img => (
                <img
                  key={img.id}
                  src={`/management/submission_photos/${img.id}`}
                  alt="Submission photo"
                  style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'cover' }}
                />
              ))}
            </div>
            {sub.images.length === 0 && <p><em>No photos.</em></p>}
            <button onClick={() => handleReview(sub.id)}>Mark as Reviewed</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReview;
