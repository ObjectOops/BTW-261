# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_12_014136) do
  create_table "comments", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.string "net_id"
    t.datetime "updated_at", null: false
  end

  create_table "kitchens", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.integer "capacity"
    t.datetime "created_at", null: false
    t.string "location"
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "photo_submissions", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.text "comment"
    t.datetime "created_at", null: false
    t.string "net_id", null: false
    t.bigint "reservation_id", null: false
    t.datetime "reviewed_at"
    t.datetime "updated_at", null: false
    t.index ["reservation_id"], name: "index_photo_submissions_on_reservation_id", unique: true
  end

  create_table "recipe_comments", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.string "recipe_slug", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_slug"], name: "index_recipe_comments_on_recipe_slug"
  end

  create_table "reservations", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.text "additional_netids"
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "end_time"
    t.bigint "kitchen_id", null: false
    t.string "netid"
    t.datetime "start_time"
    t.datetime "updated_at", null: false
    t.index ["kitchen_id"], name: "index_reservations_on_kitchen_id"
  end

  create_table "submission_photos", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "image_content_type"
    t.binary "image_data", size: :long
    t.bigint "photo_submission_id", null: false
    t.datetime "updated_at", null: false
    t.index ["photo_submission_id"], name: "index_submission_photos_on_photo_submission_id"
  end

  add_foreign_key "photo_submissions", "reservations"
  add_foreign_key "reservations", "kitchens"
  add_foreign_key "submission_photos", "photo_submissions", on_delete: :cascade
end
