class AdminReviewsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:destroy]
  def index
    # We select only the metadata to pass to React, avoiding loading heavy BLOBs in the initial payload
    @submissions = PhotoSubmission.select(:id, :net_ids, :created_at).order(created_at: :desc)
  end

  # Endpoint to serve the image out of the MySQL database
  def image
    submission = PhotoSubmission.find(params[:id])
    send_data submission.image_data, type: submission.image_content_type, disposition: 'inline'
  end

  # Delete once reviewed
  def destroy
    submission = PhotoSubmission.find(params[:id])
    submission.destroy
    render json: { success: true }
  end
end