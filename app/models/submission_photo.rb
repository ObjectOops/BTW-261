class SubmissionPhoto < ApplicationRecord
  belongs_to :photo_submission
  validates :image_data, :image_content_type, presence: true
end
