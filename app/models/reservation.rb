class Reservation < ApplicationRecord
  belongs_to :kitchen

  validates :start_time, :end_time, presence: true
end