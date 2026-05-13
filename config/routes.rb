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

  get 'kitchen-rules', to: 'kitchen_rules#show', as: :kitchen_rules

  resources :photos, only: [:index, :create, :update], controller: 'photo_submissions' do
    resources :images, only: [:create, :destroy], controller: 'submission_photos', shallow: true do
      member { get :file }
    end
  end
  resources :comments, only: [:index, :create]

  get 'about', to: 'about#index'

  namespace :management do
    root 'dashboard#index'
    resources :comments,        only: [:index],           controller: 'admin_comments'
    resources :recipe_comments, only: [:index, :destroy]
    resources :photo_reviews,   only: [:index, :destroy]
    get 'submission_photos/:id', to: 'submission_photos#show', as: :submission_photo
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
