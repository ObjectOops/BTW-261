require 'yaml'

class Recipe
  attr_reader :slug, :title, :difficulty, :time_minutes, :ingredient_count, :meal_type, :thumbnail_url, :content

  RECIPES_DIR = Rails.root.join('public', 'recipes')

  def initialize(slug:, title:, difficulty:, time_minutes:, ingredient_count:, meal_type:, thumbnail_url:, content:)
    @slug = slug
    @title = title
    @difficulty = difficulty
    @time_minutes = time_minutes
    @ingredient_count = ingredient_count
    @meal_type = meal_type
    @thumbnail_url = thumbnail_url
    @content = content
  end

  def self.all
    Dir.glob(RECIPES_DIR.join('*')).filter_map do |dir|
      next unless File.directory?(dir)
      md_path = File.join(dir, 'recipe.md')
      next unless File.exist?(md_path)
      parse(dir)
    end
  end

  def self.find(slug)
    dir = RECIPES_DIR.join(slug).to_s
    return nil unless File.directory?(dir)
    md_path = File.join(dir, 'recipe.md')
    return nil unless File.exist?(md_path)
    parse(dir)
  end

  def to_summary_hash
    {
      slug: slug,
      title: title,
      difficulty: difficulty,
      timeMinutes: time_minutes,
      ingredientCount: ingredient_count,
      mealType: meal_type,
      thumbnailUrl: thumbnail_url
    }
  end

  def to_h
    to_summary_hash.merge(content: content)
  end

  private_class_method def self.parse(dir)
    slug = File.basename(dir)
    raw = File.read(File.join(dir, 'recipe.md'))

    parts = raw.split(/^---\s*$/, 3)
    front = parts.length >= 3 ? YAML.safe_load(parts[1]) || {} : {}
    body = parts.length >= 3 ? parts[2].strip : raw.strip

    thumbnail = front['thumbnail'].presence
    thumbnail_url = thumbnail ? "/recipes/#{slug}/#{thumbnail}" : nil

    new(
      slug: slug,
      title: front['title'].to_s,
      difficulty: front['difficulty'].to_s,
      time_minutes: front['time_minutes'].to_i,
      ingredient_count: front['ingredient_count'].to_i,
      meal_type: front['meal_type'].to_s,
      thumbnail_url: thumbnail_url,
      content: body
    )
  end
end
