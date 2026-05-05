class ReservationsController < ApplicationController
  before_action :require_auth, only: [:create, :destroy]
  before_action :set_kitchen
  before_action :set_reservation, only: [:destroy]

  def create
    date_string = params[:date]
    start_hour  = params[:startHour].to_i
    duration    = params[:duration].to_i

    @reservation = @kitchen.reservations.build(
      netid:             current_net_id,
      comment:           params[:comment],
      additional_netids: params[:additionalNetids].presence
    )

    if date_string.present?
      date = Date.parse(date_string)
      @reservation.start_time = Time.zone.local(date.year, date.month, date.day, start_hour)
      @reservation.end_time   = @reservation.start_time + duration.hours
    end

    if @reservation.save
      ReservationMailer.confirmation(@reservation)
      render json: { success: true }, status: :created
    else
      render json: { errors: @reservation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @reservation.netid != current_net_id
      render json: { error: 'Not authorized to cancel this reservation.' }, status: :forbidden
      return
    end

    @reservation.destroy
    render json: { success: true }
  end

  private

  def require_auth
    return if current_net_id.present?
    render json: { error: 'You must be logged in to do that.' }, status: :unauthorized
  end

  def set_kitchen
    @kitchen = Kitchen.find(params[:kitchen_id])
  end

  def set_reservation
    @reservation = @kitchen.reservations.find(params[:id])
  end
end
