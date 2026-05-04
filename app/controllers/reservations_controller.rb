class ReservationsController < ApplicationController
  def create
    @kitchen = Kitchen.find(params[:kitchen_id])
    
    # 1. Grab the raw data from the new form
    date_string = params[:reservation_date]
    start_h = params[:start_hour].to_i
    dur = params[:duration].to_i

    # 2. Build the reservation with the NetID
    @reservation = @kitchen.reservations.build(netid: params[:netid])

    # 3. Combine the Date and Hour into a real Ruby Time object
    if date_string.present?
      date = Date.parse(date_string)
      @reservation.start_time = Time.zone.local(date.year, date.month, date.day, start_h)
      @reservation.end_time = @reservation.start_time + dur.hours
    end

    # 4. Try to save!
    if @reservation.save
      redirect_to kitchen_path(@kitchen), notice: "Reservation was successfully created! 🍳"
    else
      # If it fails, we show them an error message!
      redirect_to kitchen_path(@kitchen), alert: @reservation.errors.full_messages.to_sentence
    end
  end

  def destroy
    @kitchen = Kitchen.find(params[:kitchen_id])
    @reservation = @kitchen.reservations.find(params[:id])
    
    @reservation.destroy
    redirect_to kitchen_path(@kitchen), notice: "Reservation was successfully canceled."
  end

  private

  # This is a security feature called "Strong Parameters" 
  # It prevents hackers from submitting malicious data into your database
  def reservation_params
    params.require(:reservation).permit(:start_time, :end_time, :netid)
  end
end