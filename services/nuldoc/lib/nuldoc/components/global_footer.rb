module Nuldoc
  module Components
    class GlobalFooter
      extend DOM::HTML

      def self.render(config:)
        footer(class: 'footer') { text "&copy; #{config.site.copyright_year} #{config.site.author}" }
      end
    end
  end
end
