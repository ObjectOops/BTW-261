class PhotoSubmissionsController < ApplicationController
  before_action :require_auth

  def index
    reservations = Reservation
      .left_joins(:photo_submission)
      .where(netid: current_net_id)
      # NOTE: Comment the line below to allow submissions to all reservations.
      .where("reservations.start_time <= ?", Time.current)
      .where("photo_submissions.id IS NULL OR photo_submissions.reviewed_at IS NULL")
      .includes(:kitchen)
      .order("reservations.start_time DESC")

    submissions = PhotoSubmission.where(net_id: current_net_id, reviewed_at: nil)
                                  .includes(:submission_photos)

    @photo_submission_props = {
      reservations: reservations.map { |r|
        {
          id:        r.id,
          kitchen:   r.kitchen.name,
          startTime: r.start_time.iso8601,
          endTime:   r.end_time.iso8601
        }
      },
      submissions: submissions.map { |s| serialize_submission(s) }
    }
  end

  def create
    reservation = Reservation.find_by(id: params[:reservation_id], netid: current_net_id)
    return render json: { error: 'Reservation not found.' }, status: :not_found unless reservation

    if PhotoSubmission.exists?(reservation_id: reservation.id)
      return render json: { error: 'A submission already exists for this reservation.' }, status: :unprocessable_entity
    end

    submission = PhotoSubmission.new(
      reservation: reservation,
      net_id:      current_net_id,
      comment:     params[:comment]
    )

    unless submission.save
      return render json: { errors: submission.errors.full_messages }, status: :unprocessable_entity
    end

    Array(params[:photos]).each do |photo|
      submission.submission_photos.create!(
        image_data:         photo.read,
        image_content_type: photo.content_type
      )
    end

    render json: serialize_submission(submission.reload), status: :created
  end

  def update
    submission = PhotoSubmission.find_by(id: params[:id], net_id: current_net_id)
    return render json: { error: 'Not found.' }, status: :not_found unless submission
    return render json: { error: 'This submission has been reviewed and cannot be changed.' }, status: :forbidden if submission.reviewed_at.present?

    if submission.update(comment: params[:comment])
      render json: { success: true }
    else
      render json: { errors: submission.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def require_auth
    return if current_net_id.present?
    render json: { error: 'You must be logged in to do that.' }, status: :unauthorized
  end

  def serialize_submission(s)
    {
      id:             s.id,
      reservation_id: s.reservation_id,
      comment:        s.comment,
      photos:         s.submission_photos.map { |p| { id: p.id } }
    }
  end
end
