class Management::AdminCommentsController < Management::BaseController
  def index
    comments = Comment.order(created_at: :desc)
    @admin_props = {
      comments: comments.map { |c| { id: c.id, body: c.body, netId: c.net_id, createdAt: c.created_at.iso8601 } }
    }
  end
end
