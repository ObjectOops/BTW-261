class KitchensController < ApplicationController
  # This runs when you go to the root URL "/" or "/kitchens"
  def index
    @kitchens = Kitchen.all
  end

  # This runs when you go to "/kitchens/1" to see the North Hall Kitchen
  def show
    @kitchen = Kitchen.find(params[:id])
    # We also load the reservations for this specific kitchen
    @reservations = @kitchen.reservations
  end
end