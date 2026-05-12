class RefactorPhotoSubmissions < ActiveRecord::Migration[8.1]
  def change
    execute "DELETE FROM photo_submissions"

    remove_column :photo_submissions, :net_ids, :string
    remove_column :photo_submissions, :image_data, :binary
    remove_column :photo_submissions, :image_content_type, :string

    add_column :photo_submissions, :reservation_id, :bigint, null: false
    add_column :photo_submissions, :net_id, :string, null: false
    add_column :photo_submissions, :comment, :text

    add_index :photo_submissions, :reservation_id, unique: true
    add_foreign_key :photo_submissions, :reservations

    create_table :submission_photos do |t|
      t.references :photo_submission, null: false, foreign_key: { on_delete: :cascade }
      t.binary :image_data, size: :long
      t.string :image_content_type
      t.timestamps
    end
  end
end
