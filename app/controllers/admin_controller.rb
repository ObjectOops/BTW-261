class AdminController < ApplicationController
  def index
    comments = Comment.order(created_at: :desc)
    @admin_props = {
      comments: comments.map { |c| { id: c.id, body: c.body, createdAt: c.created_at.iso8601 } }
    }
  end
end
