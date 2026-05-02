class CommentsController < ApplicationController
  def index
  end

  def create
    comment = Comment.new(comment_params)
    if comment.save
      render json: { success: true }, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:body)
  end
end
