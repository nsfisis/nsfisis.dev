module Nuldoc
  module Components
    class StaticScript < DOM::HTMLBuilder
      def initialize(file_name:, config:, site: nil, type: nil, defer: nil)
        super()
        @file_name = file_name
        @config = config
        @site = site
        @type = type
        @defer = defer
      end

      def build
        file_path = File.join(Dir.pwd, @config.locations.static_dir, @site || '_all', @file_name)
        hash = ComponentUtils.calculate_file_hash(file_path)
        attrs = { src: "#{@file_name}?h=#{hash}" }
        attrs[:type] = @type if @type
        attrs[:defer] = @defer if @defer
        script(**attrs)
      end
    end
  end
end
