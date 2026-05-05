class KitchensController < ApplicationController
  def index
    @kitchens = Kitchen.all
  end

  def show
    @kitchen = Kitchen.find(params[:id])
    @reservations = @kitchen.reservations
  end
end