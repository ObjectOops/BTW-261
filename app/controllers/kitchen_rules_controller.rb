class KitchenRulesController < ApplicationController
  def show
    content = File.read(Rails.root.join('public', 'kitchen-rules.md'))
    @kitchen_rules_props = { content: content }
  end
end
