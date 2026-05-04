Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  
  # Defines the root path route ("/")
  root "home#index"

  resources :comments, only: [:index, :create]
  get "/admin", to: "admin#index"

  get  "/recipes",                     to: "recipes#index"
  get  "/recipes/:slug",               to: "recipes#show",           as: :recipe
  get  "/recipes/:slug/comment",       to: "recipe_comments#new",    as: :new_recipe_comment
  post "/recipes/:slug/comments",      to: "recipe_comments#create", as: :recipe_comments
  get  "/admin/recipe-comments",       to: "admin_recipe_comments#index"
  delete "/admin/recipe-comments/:id", to: "admin_recipe_comments#destroy", as: :admin_recipe_comment

  resources :photo_submissions, only: [:index, :create]
  
  # Routes for admins to review photos, fetch the raw image data, and delete them
  resources :admin_reviews, only: [:index, :destroy] do
    member do
      get :image # Creates the /admin_reviews/:id/image endpoint
    end
  end
  
  resources :kitchens do
    resources :reservations, only: [:new, :create, :index, :destroy]
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
