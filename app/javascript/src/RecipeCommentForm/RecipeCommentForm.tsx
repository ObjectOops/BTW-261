import React, { useState } from 'react';

interface Props {
  recipeSlug: string;
  errors?: string[];
}

type Status = 'idle' | 'submitting' | 'error';

const RecipeCommentForm: React.FC<Props> = ({ recipeSlug, errors: initialErrors }) => {
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<string[]>(initialErrors ?? []);

  const csrfToken = (): string =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrors([]);

    try {
      const res = await fetch(`/recipes/${recipeSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken(),
        },
        body: JSON.stringify({ recipe_comment: { body } }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        window.location.href = data.redirect ?? `/recipes/${recipeSlug}`;
        return;
      }

      setErrors(data.errors ?? ['Something went wrong. Please try again.']);
      setStatus('error');
    } catch {
      setErrors(['Network error. Please try again.']);
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: 16 }}>
        <a href={`/recipes/${recipeSlug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          ← Back to recipe
        </a>
      </div>

      <h1>Leave a Comment</h1>

      {errors.length > 0 && (
        <ul style={{ color: 'red', paddingLeft: 20, marginBottom: 16 }}>
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Write your comment…"
          required
          style={{ width: '100%', padding: 10, border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{ marginTop: 12, padding: '10px 24px', border: '1px solid #333', background: 'none', cursor: 'pointer' }}
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default RecipeCommentForm;
