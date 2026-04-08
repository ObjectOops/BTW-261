#!/bin/bash

set -e

nvm install 18.20.8
nvm use 18.20.8

bin/setup --skip-server
gem install foreman
