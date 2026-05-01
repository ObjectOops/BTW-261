import React, { useState } from 'react';

interface AdminRecipeComment {
  id: number;
  body: string;
  recipeSlug: string;
  createdAt: string;
}

interface Props {
  comments: AdminRecipeComment[];
}

const csrfToken = (): string =>
  (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const AdminRecipeComments: React.FC<Props> = ({ comments: initial }) => {
  const [comments, setComments] = useState(initial);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch(`/admin/recipe-comments/${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken() },
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>Admin — Recipe Comments</h1>

      {comments.length === 0 ? (
        <p>No comments.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Recipe</th>
              <th style={{ padding: '8px 12px' }}>Comment</th>
              <th style={{ padding: '8px 12px' }}>Date</th>
              <th style={{ padding: '8px 12px' }}></th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <a href={`/recipes/${c.recipeSlug}`} style={{ color: 'inherit' }}>{c.recipeSlug}</a>
                </td>
                <td style={{ padding: '10px 12px' }}>{c.body}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#777', fontSize: 13 }}>
                  {new Date(c.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    style={{ padding: '4px 12px', border: '1px solid #c00', color: '#c00', background: 'none', cursor: 'pointer' }}
                  >
                    {deleting === c.id ? '…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRecipeComments;
