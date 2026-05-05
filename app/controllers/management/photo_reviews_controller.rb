class Management::PhotoReviewsController < Management::BaseController
  def index
    @submissions = PhotoSubmission.select(:id, :net_ids, :created_at).order(created_at: :desc)
  end

  def image
    submission = PhotoSubmission.find(params[:id])
    send_data submission.image_data, type: submission.image_content_type, disposition: 'inline'
  end

  def destroy
    submission = PhotoSubmission.find(params[:id])
    submission.destroy
    render json: { success: true }
  end
end
