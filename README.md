# BTW-261 [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/ObjectOops/BTW-261/tree/staging?quickstart=1)

## Foodstuff

Foodstuff is a prototype kitchen reservation and cooking recipes solution developed as a final project for Principles of Technical Communication (BTW 261) at UIUC.



This is a **Ruby on Rails + React** app hosted on Illinois' cPanel with Shibboleth SSO.

### Features

- Per-location communal kitchen reservation via calendar view
- Recipes rendered from Markdown with comments
- Kitchen condition photo submission form
- Management photo review
- Shibboleth SSO

## Development

- Ruby 4.0.1 or >= 3.2.11
- Node 18

Dev Container / Codespaces will automatically setup the project.  
Use the VS Code task "Start Rails (HMR)" to start the development server, or `./bin/dev`.

Manual dependency install:
```sh
bin/setup --skip-server
gem install foreman
```

## Patching Deployment

Merge into `prod`, pull, and proceed with the following steps:
```sh
source ./bin/illinois_activate    # Activate cPanel env
./bin/illinois_precompile         # `react_on_rails:generate_packs` and `assets:precompile`
./bin/rails db:migrate            # Apply DB migrations
./bin/illinois_shibboleth         # Update Apache .htaccess files for Shibboleth SSO
touch tmp/restart.txt             # Signal restart Apache reverse proxy
```
