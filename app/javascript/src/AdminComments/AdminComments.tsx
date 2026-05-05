import React from 'react';

interface Comment {
  id: number;
  body: string;
  netId: string | null;
  createdAt: string;
}

interface Props {
  comments: Comment[];
}

const AdminComments: React.FC<Props> = ({ comments }) => {
  return (
    <div>
      <h1>Admin — Site Comments</h1>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.body}</p>
              <small>
                {comment.netId && <>{comment.netId} · </>}
                {new Date(comment.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminComments;
