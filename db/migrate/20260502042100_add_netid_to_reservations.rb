class AddNetidToReservations < ActiveRecord::Migration[8.1]
  def change
    add_column :reservations, :netid, :string
  end
end
