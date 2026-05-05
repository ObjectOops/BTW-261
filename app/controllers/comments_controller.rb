class CommentsController < ApplicationController
  def index
  end

  def create
    comment = Comment.new(comment_params.merge(net_id: current_net_id))
    if comment.save
      render json: { success: true }, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def current_net_id
    return nil if Rails.env.development?
    request.env['eppn']&.split('@')&.first
  end

  def comment_params
    params.require(:comment).permit(:body)
  end
end
