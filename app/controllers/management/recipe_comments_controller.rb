class Management::RecipeCommentsController < Management::BaseController
  def index
    comments = RecipeComment.order(created_at: :desc)
    @admin_props = {
      comments: comments.map { |c|
        { id: c.id, body: c.body, recipeSlug: c.recipe_slug, createdAt: c.created_at.iso8601 }
      }
    }
  end

  def destroy
    comment = RecipeComment.find(params[:id])
    comment.destroy
    render json: { success: true }
  end
end
