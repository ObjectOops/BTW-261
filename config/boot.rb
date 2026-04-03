ENV["PATH"] = File.expand_path("~/nodevenv/BTW-261/18/bin") + ":" + ENV["PATH"]

ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.
