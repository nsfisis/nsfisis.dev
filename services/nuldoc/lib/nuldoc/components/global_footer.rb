module Nuldoc
  module Components
    class GlobalFooter
      extend Dom

      def self.render(config:)
        footer({ 'class' => 'footer' }, "&copy; #{config.site.copyright_year} #{config.site.author}")
      end
    end
  end
end
