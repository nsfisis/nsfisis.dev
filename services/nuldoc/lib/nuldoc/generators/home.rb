module Nuldoc
  module Generators
    class Home
      def initialize(config)
        @config = config
      end

      def generate
        html = Pages::HomePage.render(config: @config)

        Page.new(
          root: html,
          renderer: :html,
          site: 'default',
          dest_file_path: '/index.html',
          href: '/'
        )
      end
    end
  end
end
