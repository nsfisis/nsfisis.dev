module Nuldoc
  module Components
    class StaticStylesheet < DOM::HTMLBuilder
      def initialize(file_name:, config:, site: nil)
        super()
        @file_name = file_name
        @config = config
        @site = site
      end

      def build
        file_path = File.join(Dir.pwd, @config.locations.static_dir, @site || '_all', @file_name)
        hash = ComponentUtils.calculate_file_hash(file_path)
        link rel: 'stylesheet', href: "#{@file_name}?h=#{hash}"
      end
    end
  end
end
