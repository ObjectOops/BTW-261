class KitchensController < ApplicationController
  def index
    @kitchens = Kitchen.all
  end

  def show
    @kitchen = Kitchen.find(params[:id])
    @kitchen_show_props = {
      kitchen: {
        id: @kitchen.id,
        name: @kitchen.name,
        location: @kitchen.location,
        capacity: @kitchen.capacity
      },
      reservations: @kitchen.reservations.order(:start_time).map do |r|
        {
          id: r.id,
          netid: r.netid,
          startTime: r.start_time.iso8601,
          endTime: r.end_time.iso8601,
          comment: r.comment,
          additionalNetids: r.additional_netids
        }
      end,
      currentNetId: current_net_id,
      loginUrl: Rails.env.development? ? nil : "/Shibboleth.sso/Login?target=#{CGI.escape(request.fullpath)}"
    }
  end
end