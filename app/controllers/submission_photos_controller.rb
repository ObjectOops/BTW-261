class SubmissionPhotosController < ApplicationController
  before_action :require_auth
  before_action :set_submission, only: [:create]
  before_action :set_photo,      only: [:destroy, :file]

  def create
    photo_file = params[:photo]
    return render json: { error: 'No photo attached.' }, status: :unprocessable_entity unless photo_file
    return render json: { error: 'This submission has been reviewed and cannot be changed.' }, status: :forbidden if @submission.reviewed_at.present?

    image = @submission.submission_photos.create(
      image_data:         photo_file.read,
      image_content_type: photo_file.content_type
    )

    if image.persisted?
      render json: { id: image.id }, status: :created
    else
      render json: { errors: image.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    return render json: { error: 'This submission has been reviewed and cannot be changed.' }, status: :forbidden if @photo.photo_submission.reviewed_at.present?

    @photo.destroy
    render json: { success: true }
  end

  def file
    send_data @photo.image_data, type: @photo.image_content_type, disposition: 'inline'
  end

  private

  def require_auth
    return if current_net_id.present?
    render json: { error: 'You must be logged in to do that.' }, status: :unauthorized
  end

  def set_submission
    @submission = PhotoSubmission.find_by(id: params[:photo_id], net_id: current_net_id)
    render json: { error: 'Not found.' }, status: :not_found unless @submission
  end

  def set_photo
    photo = SubmissionPhoto.find_by(id: params[:id])
    unless photo&.photo_submission&.net_id == current_net_id
      render json: { error: 'Not authorized.' }, status: :forbidden
      return
    end
    @photo = photo
  end
end
