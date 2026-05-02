class CreateKitchens < ActiveRecord::Migration[8.1]
  def change
    create_table :kitchens do |t|
      t.string :name
      t.string :location
      t.integer :capacity

      t.timestamps
    end
  end
end
