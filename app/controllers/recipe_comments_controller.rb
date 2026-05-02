class RecipeCommentsController < ApplicationController
  def new
    @comment_form_props = { recipeSlug: params[:slug] }
  end

  def create
    comment = RecipeComment.new(recipe_slug: params[:slug], body: params.dig(:recipe_comment, :body))
    if comment.save
      render json: { redirect: recipe_url(params[:slug]) }, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
