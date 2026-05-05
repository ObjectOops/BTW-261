class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  helper_method :current_net_id

  def current_net_id
    return 'dev_user' if Rails.env.development?
    request.env['eppn']&.split('@')&.first
  end
end
