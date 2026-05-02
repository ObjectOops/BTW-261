import React, { useState } from 'react';

const CommentForm: React.FC = () => {
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const getCsrfToken = (): string => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? (meta as HTMLMetaElement).content : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({ comment: { body } }),
      });

      if (response.ok) {
        setStatus('success');
        setBody('');
      } else {
        const data = await response.json();
        setErrorMessage(data.errors?.join(', ') || 'Submission failed.');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div>
      <h1>Leave a Comment</h1>
      {status === 'success' ? (
        <p>Comment submitted!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="comment-body">Your comment</label>
            <br />
            <textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              cols={60}
              required
            />
          </div>
          {status === 'error' && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentForm;
