class Management::BaseController < ApplicationController
  before_action :require_management_auth

  private

  def require_management_auth
    # Shibboleth auth will be wired here for production.
    # No-op during development.
  end
end
