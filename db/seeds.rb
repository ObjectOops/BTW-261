# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Clear out old data so we don't create duplicates if we run this multiple times
Reservation.destroy_all
Kitchen.destroy_all

# Create a couple of dummy kitchens
Kitchen.create!(name: "ISR Kitchen", location: "Floor 1", capacity: 4)
Kitchen.create!(name: "PAR Kitchen", location: "Basement", capacity: 4)
Kitchen.create!(name: "IKE Kitchen", location: "Scott Hall", capacity: 4)
Kitchen.create!(name: "IKE Kitchen", location: "Weston Hall", capacity: 4)

puts "Seed data successfully created!"