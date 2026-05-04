import React, { useState } from 'react';

interface Submission {
  id: number;
  net_ids: string;
}

interface Props {
  initialSubmissions: Submission[];
}

const AdminReview = ({ initialSubmissions }: Props) => {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

  const handleReview = async (id: number) => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const response = await fetch(`/admin_reviews/${id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });

    if (response.ok) {
      // Remove it from the UI once successfully deleted from the database
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
          <div key={sub.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <p><strong>NetIDs:</strong> {sub.net_ids}</p>
            {/* The image src points directly to the controller endpoint we made */}
            <img 
              src={`/admin_reviews/${sub.id}/image`} 
              alt="Verification" 
              style={{ maxWidth: '300px', display: 'block', marginBottom: '1rem' }} 
            />
            <button onClick={() => handleReview(sub.id)}>Mark as Reviewed (Delete)</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReview;