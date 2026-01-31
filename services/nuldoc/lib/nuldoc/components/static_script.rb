module Nuldoc
  module Components
    class StaticScript
      extend DOM::HTML

      def self.render(file_name:, config:, site: nil, type: nil, defer: nil)
        file_path = File.join(Dir.pwd, config.locations.static_dir, site || '_all', file_name)
        hash = ComponentUtils.calculate_file_hash(file_path)
        attrs = { src: "#{file_name}?h=#{hash}" }
        attrs[:type] = type if type
        attrs[:defer] = defer if defer
        script(**attrs)
      end
    end
  end
end
