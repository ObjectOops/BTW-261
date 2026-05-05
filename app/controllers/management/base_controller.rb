class Management::BaseController < ApplicationController
  before_action :require_management_auth

  private

  def require_management_auth
    # Protected at Apache level via public/management/.htaccess (Shibboleth).
    # No-op in Rails — web server enforces the session before Passenger handles the request.
  end
end
