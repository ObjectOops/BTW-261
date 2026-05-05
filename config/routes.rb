Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "home#index"

  resources :recipes, only: [:index, :show], param: :slug do
    get  'comments/new', to: 'recipe_comments#new',    as: :new_comment
    post 'comments',     to: 'recipe_comments#create', as: :comments
  end

  resources :kitchens, only: [:index, :show] do
    resources :reservations, only: [:new, :create, :index, :destroy]
  end

  resources :photos,   only: [:index, :create], controller: 'photo_submissions'
  resources :comments, only: [:index, :create]

  namespace :management do
    root 'dashboard#index'
    resources :comments,        only: [:index],           controller: 'admin_comments'
    resources :recipe_comments, only: [:index, :destroy]
    resources :photo_reviews,   only: [:index, :destroy] do
      member { get :image }
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
