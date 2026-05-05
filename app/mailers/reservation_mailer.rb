class ReservationMailer
  def self.confirmation(reservation)
    return if Rails.env.development?

    email   = "#{reservation.netid}@illinois.edu"
    subject = "Your Foodstuff Kitchen Reservation"
    body    = <<~TEXT
      Hi #{reservation.netid},

      Your kitchen reservation has been confirmed.
      Here is your reservation for reference:

      Kitchen: #{reservation.kitchen.name} (#{reservation.kitchen.location})
      Date:    #{reservation.start_time.strftime('%A, %B %d, %Y')}
      Time:    #{reservation.start_time.strftime('%I:%M %p')} – #{reservation.end_time.strftime('%I:%M %p')}

      #{reservation.additional_netids.present? ? "Additional guests: #{reservation.additional_netids}\n" : ''}
      #{reservation.comment.present? ? "Note: #{reservation.comment}\n" : ''}

      ‼️This is a friendly reminder of a few important guidelines to follow during your reservation:

      • Before you begin using the kitchen, please take clear photos of the space and upload them as required.
      • After you finish, please take another set of photos to document the condition of the kitchen and upload them as well.

      These steps help us maintain a clean and fair shared environment for all residents.

      If you have any questions or encounter any issues during your reservation, please feel free to reach out to the front desk staff of your assigned kitchen location for assistance.

      Thank you for your cooperation, and we hope you have a great experience!
      
      Foodstuff
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
