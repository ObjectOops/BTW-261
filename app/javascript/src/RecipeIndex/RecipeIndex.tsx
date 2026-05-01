import React, { useState, useMemo } from 'react';

interface RecipeSummary {
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes: number;
  ingredientCount: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  thumbnailUrl: string | null;
}

interface Props {
  recipes: RecipeSummary[];
}

type SortKey = 'default' | 'name' | 'time' | 'ingredients';

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };

const RecipeIndex: React.FC<Props> = ({ recipes }) => {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [mealType, setMealType] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const displayed = useMemo(() => {
    let result = recipes.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (difficulty && r.difficulty !== difficulty) return false;
      if (mealType && r.mealType !== mealType) return false;
      return true;
    });

    if (sortKey === 'name') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortKey === 'time') result = [...result].sort((a, b) => a.timeMinutes - b.timeMinutes);
    else if (sortKey === 'ingredients') result = [...result].sort((a, b) => a.ingredientCount - b.ingredientCount);

    return result;
  }, [recipes, search, difficulty, mealType, sortKey]);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: 16 }}>
        <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>← Home</a>
      </div>
      <h1>Recipes</h1>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ccc', flex: '1 1 160px' }}
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ccc' }}
        >
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ccc' }}
        >
          <option value="">All meal types</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          style={{ padding: '8px 12px', border: '1px solid #ccc' }}
        >
          <option value="default">Sort: Default</option>
          <option value="name">Sort: Name</option>
          <option value="time">Sort: Time</option>
          <option value="ingredients">Sort: Ingredients</option>
        </select>
      </div>

      {displayed.length === 0 ? (
        <p>No recipes match your filters.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {displayed.map((recipe) => (
            <a
              key={recipe.slug}
              href={`/recipes/${recipe.slug}`}
              style={{ border: '1px solid #ccc', textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              {recipe.thumbnailUrl && (
                <img
                  src={recipe.thumbnailUrl}
                  alt={recipe.title}
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                />
              )}
              <div style={{ padding: '12px 16px' }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{recipe.title}</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13, color: '#555' }}>
                  <span style={{ textTransform: 'capitalize' }}>{recipe.difficulty}</span>
                  <span>·</span>
                  <span>{recipe.timeMinutes} min</span>
                  <span>·</span>
                  <span>{recipe.ingredientCount} ingredients</span>
                  <span>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{recipe.mealType}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeIndex;
