class CreateRecipeComments < ActiveRecord::Migration[8.1]
  def change
    create_table :recipe_comments do |t|
      t.string :recipe_slug, null: false
      t.text :body, null: false

      t.timestamps
    end
    add_index :recipe_comments, :recipe_slug
  end
end
