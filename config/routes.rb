Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # These lines are all you need for your feature!
  # Your page will be accessible at: localhost:3000/kitchens
  resources :kitchens do
    resources :reservations, only: [:new, :create, :index, :destroy]
  end

  # add root path down here
  # root "home#index" 
 end