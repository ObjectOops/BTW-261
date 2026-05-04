class PhotoSubmissionsController < ApplicationController
  def index
  end

  def create
    photo = params[:photo]
    
    # Catch empty submissions to prevent 500 errors
    if photo.nil?
      return render json: { success: false, errors: ['No photo was attached'] }, status: :unprocessable_entity
    end

    submission = PhotoSubmission.new(
      net_ids: params[:net_ids],
      image_data: photo.read,
      image_content_type: photo.content_type
    )

    if submission.save
      render json: { success: true, message: 'Photo submitted!' }
    else
      render json: { success: false, errors: submission.errors.full_messages }, status: :unprocessable_entity
    end
  end
end