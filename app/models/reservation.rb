class Reservation < ApplicationRecord
  belongs_to :kitchen
  has_one :photo_submission

  # Basic checks
  validates :start_time, :end_time, :netid, presence: true
  
  # Our custom security rules
  validate :no_overlapping_reservations
  validate :duration_must_be_valid
  validate :within_operating_hours
  validate :max_two_per_day
  validate :start_time_not_in_past

  private

  # Rule 1: Prevent double-booking
  def no_overlapping_reservations
    if Reservation.where(kitchen_id: kitchen_id)
                  .where.not(id: id) 
                  .where("start_time < ? AND end_time > ?", end_time, start_time)
                  .exists?
      errors.add(:base, "Sorry! This kitchen is already booked during that time.")
    end
  end

  # Rule 2: Prevent bookings longer than 2 hours
  def duration_must_be_valid
    return if start_time.blank? || end_time.blank? 

    duration_in_hours = (end_time - start_time) / 1.hour

    if duration_in_hours <= 0
      errors.add(:end_time, "must be after the start time.")
    elsif duration_in_hours > 2
      errors.add(:base, "Reservations can only be a maximum of 2 hours.")
    end
  end

  # Rule 3: Enforce 8 AM to 10 PM operating hours
  def within_operating_hours
    return if start_time.blank? || end_time.blank?

    if start_time.hour < 8 || end_time.hour > 22 || (end_time.hour == 22 && end_time.min > 0)
      errors.add(:base, "The kitchen is only open between 8:00 AM and 10:00 PM.")
    end
  end

  # Rule 4: Max 2 reservations per netid per day
  def max_two_per_day
    return if start_time.blank? || netid.blank?

    count = Reservation.where(netid: netid)
                       .where.not(id: id)
                       .where(start_time: start_time.beginning_of_day..start_time.end_of_day)
                       .count
    errors.add(:base, 'You may only make 2 reservations per day.') if count >= 2
  end

  # Rule 5: No past reservations
  def start_time_not_in_past
    return if start_time.blank?

    errors.add(:base, 'Reservations cannot be made for times that have already passed.') if start_time < Time.current
  end
end