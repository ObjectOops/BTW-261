class CreatePhotoSubmissions < ActiveRecord::Migration[8.1]
  def change
    create_table :photo_submissions do |t|
      t.string :net_ids
      t.binary :image_data, limit: 16.megabytes
      t.string :image_content_type

      t.timestamps
    end
  end
end
