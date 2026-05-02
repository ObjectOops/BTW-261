class ReservationsController < ApplicationController
  def create
    # First, find the kitchen we are trying to book
    @kitchen = Kitchen.find(params[:kitchen_id])
    
    # Next, build a new reservation attached to that kitchen
    @reservation = @kitchen.reservations.build(reservation_params)

    # Finally, try to save it to the database
    if @reservation.save
      redirect_to kitchen_path(@kitchen), notice: "Reservation was successfully created! 🍳"
    else
      redirect_to kitchen_path(@kitchen), alert: "Failed to create reservation. Make sure times are filled out."
    end
  end

  private

  # This is a security feature called "Strong Parameters" 
  # It prevents hackers from submitting malicious data into your database
  def reservation_params
    params.require(:reservation).permit(:start_time, :end_time)
  end
end