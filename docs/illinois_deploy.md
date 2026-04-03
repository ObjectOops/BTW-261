# Illinois cPanel Deployment Overview

1. Set up MySQL database and user (Databases > Manage My Databases)
1. Add user with all privileges to database
1. From a local environment, checkout branch `prod` and create database credentials for Rails
    ```sh
    EDITOR=nano ./bin/rails credentials:edit --environment production

    # database:
    #   name: <database name>
    #   username: <username>
    #   password: <user password>
    ```
1. Push `config/credentials/production.yml.enc`
1. Clone repo into cPanel instance and checkout `prod`
1. Manually create and copy-paste the contents of `config/credentials/production.key` from the local environment to the instance
1. On cPanel, use "Setup Node.js App" on the application directory with Node v18.20.8
1. Disable the Node.js App (we set it up just for the virtual environment files)
1. Use "Setup Ruby App" with Ruby version 3.2
1. Delete the `app.js` file automatically created within the app directory
1. Activate environment
    ```sh
    source ./bin/illinois_activate
    ```
1. Install dependencies
    ```sh
    bundle install
    npm install
    ```
1. Fix Nokogiri gem
    ```sh
    bundle config set force_ruby_platform true && bundle install
    ```
1. Prepare database
    ```sh
    RAILS_ENV=production ./bin/rails db:prepare
    ```
1. Generate packs
    ```sh
    ./bin/rake react_on_rails:generate_packs
    ```
1. Precompile assets
    ```sh
    RAILS_ENV=production bundle exec rails assets:precompile
    ```
1. On cPanel, restart the Ruby app (Errors: Metrics > Errors)
