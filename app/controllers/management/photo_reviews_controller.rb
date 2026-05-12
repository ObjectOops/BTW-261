class Management::PhotoReviewsController < Management::BaseController
  def index
    submissions = PhotoSubmission.where(reviewed_at: nil)
                                  .includes(:submission_photos, reservation: :kitchen)
                                  .order(created_at: :desc)

    @submissions = submissions.map do |s|
      {
        id:      s.id,
        net_id:  s.net_id,
        kitchen: s.reservation.kitchen.name,
        date:    s.reservation.start_time.strftime('%b %-d, %Y'),
        images:  s.submission_photos.map { |p| { id: p.id } }
      }
    end
  end

  def destroy
    submission = PhotoSubmission.find(params[:id])
    submission.update!(reviewed_at: Time.current)
    render json: { success: true }
  end
end
