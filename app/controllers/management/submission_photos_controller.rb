class Management::SubmissionPhotosController < Management::BaseController
  def show
    photo = SubmissionPhoto.find(params[:id])
    send_data photo.image_data, type: photo.image_content_type, disposition: 'inline'
  end
end
