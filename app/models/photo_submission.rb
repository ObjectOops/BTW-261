class PhotoSubmission < ApplicationRecord
  belongs_to :reservation
  has_many :submission_photos, dependent: :destroy

  validates :reservation_id, :net_id, presence: true
  validates :reservation_id, uniqueness: true
end
