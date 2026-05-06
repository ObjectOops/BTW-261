class KitchenRulesController < ApplicationController
  def show
    path = Rails.root.join('public', 'kitchen-rules.md')
    content = path.exist? ? File.read(path) : ''
    @kitchen_rules_props = { content: content }
  end
end
