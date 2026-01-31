require 'toml-rb'

module Nuldoc
  class SlideParser
    def initialize(file_path)
      @file_path = file_path
    end

    def parse
      metadata = TomlRB.load_file(@file_path)
      SlideFactory.new(metadata, @file_path).create
    rescue StandardError => e
      raise e.class, "#{e.message} in #{@file_path}"
    end
  end
end
