class AddReviewedAtToPhotoSubmissions < ActiveRecord::Migration[8.1]
  def change
    add_column :photo_submissions, :reviewed_at, :datetime
  end
end
