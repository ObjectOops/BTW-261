class ReservationMailer
  def self.confirmation(reservation)
    return if Rails.env.development?

    email   = "#{reservation.netid}@illinois.edu"
    subject = "Your Foodstuff Kitchen Reservation"
    body    = <<~TEXT
      Hi #{reservation.netid},

      Your kitchen reservation has been confirmed.

      Kitchen: #{reservation.kitchen.name} (#{reservation.kitchen.location})
      Date:    #{reservation.start_time.strftime('%A, %B %d, %Y')}
      Time:    #{reservation.start_time.strftime('%I:%M %p')} – #{reservation.end_time.strftime('%I:%M %p')}

      #{reservation.additional_netids.present? ? "Additional guests: #{reservation.additional_netids}\n" : ''}
      #{reservation.comment.present? ? "Note: #{reservation.comment}\n" : ''}
      Questions? Reply to this email or visit the Foodstuff site.

      – Foodstuff
    TEXT

    system(
      "echo #{Shellwords.escape(body.strip)} | mailx " \
      "-S smtp=outbound-relays.techservices.illinois.edu " \
      "-s #{Shellwords.escape(subject)} " \
      "-r '\"Foodstuff\" <noreply@illinois.edu>' " \
      "#{Shellwords.escape(email)}"
    )
  end
end
