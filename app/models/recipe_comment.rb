class RecipeComment < ApplicationRecord
  validates :recipe_slug, :body, presence: true

  scope :for_recipe, ->(slug) { where(recipe_slug: slug).order(created_at: :desc) }
end
