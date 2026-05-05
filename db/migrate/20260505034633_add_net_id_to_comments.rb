class AddNetIdToComments < ActiveRecord::Migration[8.1]
  def change
    add_column :comments, :net_id, :string
  end
end
