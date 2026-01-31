module Nuldoc
  module Generators
    class SlideList
      def initialize(slides, config)
        @slides = slides
        @config = config
      end

      def generate
        html = Pages::SlideListPage.render(slides: @slides, config: @config)

        Page.new(
          root: html,
          renderer: :html,
          site: 'slides',
          dest_file_path: '/slides/index.html',
          href: '/slides/'
        )
      end
    end
  end
end
