module Nuldoc
  module Generators
    class About
      def initialize(slides, config)
        @slides = slides
        @config = config
      end

      def generate
        html = Pages::AboutPage.new(slides: @slides, config: @config).render

        Page.new(
          root: html,
          renderer: :html,
          site: 'about',
          dest_file_path: '/index.html',
          href: '/'
        )
      end
    end
  end
end
