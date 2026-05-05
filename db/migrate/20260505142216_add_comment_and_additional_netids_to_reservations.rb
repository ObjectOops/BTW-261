class AddCommentAndAdditionalNetidsToReservations < ActiveRecord::Migration[8.1]
  def change
    add_column :reservations, :comment, :text
    add_column :reservations, :additional_netids, :text
  end
end
