module Nuldoc
  module Components
    class GlobalFooter < DOM::HTMLBuilder
      def initialize(config:)
        super()
        @config = config
      end

      def build
        footer(class: 'footer') { text "&copy; #{@config.site.copyright_year} #{@config.site.author}" }
      end
    end
  end
end
