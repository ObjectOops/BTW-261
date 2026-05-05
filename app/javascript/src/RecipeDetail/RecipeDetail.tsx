import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RecipeDetail {
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes: number;
  ingredientCount: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  thumbnailUrl: string | null;
  content: string;
}

interface RecipeComment {
  id: number;
  body: string;
  createdAt: string;
}

interface Props {
  recipe: RecipeDetail;
  comments: RecipeComment[];
  recipeSlug: string;
}

const RecipeDetail: React.FC<Props> = ({ recipe, comments, recipeSlug }) => {
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: 16 }}>
        <a href="/recipes" style={{ color: 'inherit', textDecoration: 'none' }}>← Recipes</a>
      </div>

      {recipe.thumbnailUrl && (
        <img
          src={recipe.thumbnailUrl}
          alt={recipe.title}
          style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block', marginBottom: 24 }}
        />
      )}

      <h1 style={{ marginBottom: 8 }}>{recipe.title}</h1>

      <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#555', marginBottom: 32, flexWrap: 'wrap' }}>
        <span style={{ textTransform: 'capitalize' }}><strong>Difficulty:</strong> {recipe.difficulty}</span>
        <span><strong>Time:</strong> {recipe.timeMinutes} min</span>
        <span><strong>Ingredients:</strong> {recipe.ingredientCount}</span>
        <span style={{ textTransform: 'capitalize' }}><strong>Meal:</strong> {recipe.mealType}</span>
      </div>

      <div style={{ lineHeight: 1.7 }}>
        <Markdown remarkPlugins={[remarkGfm]}>{recipe.content}</Markdown>
      </div>

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <section>
        <h2>Comments</h2>
        {comments.length === 0 ? (
          <p style={{ color: '#777' }}>No comments yet. Be the first!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
            {comments.map((c) => (
              <li key={c.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
                <p style={{ margin: '0 0 4px' }}>{c.body}</p>
                <small style={{ color: '#999' }}>{new Date(c.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
        <a
          href={`/recipes/${recipeSlug}/comments/new`}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            border: '1px solid #333',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          Leave a comment
        </a>
      </section>
    </div>
  );
};

export default RecipeDetail;
