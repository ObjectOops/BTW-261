class RecipesController < ApplicationController
  def index
    @recipes_props = { recipes: Recipe.all.shuffle.map(&:to_summary_hash) }
  end

  def show
    recipe = Recipe.find(params[:slug])
    render plain: 'Recipe not found', status: :not_found and return if recipe.nil?

    comments = RecipeComment.for_recipe(params[:slug]).map do |c|
      { id: c.id, body: c.body, createdAt: c.created_at.iso8601 }
    end

    @recipe_props = {
      recipe: recipe.to_h,
      comments: comments,
      recipeSlug: params[:slug]
    }
  end
end
