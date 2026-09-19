module Nuldoc
  module Components
    class GlobalFooter < DOM::HTMLBuilder
      def initialize(config:)
        super()
        @config = config
      end

      def build
        site = @config.site
        footer(class: 'footer') { text "&copy; #{site.copyright_year}-#{site.current_year} #{site.author}" }
      end
    end
  end
end
