module Nuldoc
  module Generators
    class About
      def initialize(slides, staff_records, config)
        @slides = slides
        @staff_records = staff_records
        @config = config
      end

      def generate
        html = Pages::AboutPage.new(slides: @slides, staff_records: @staff_records, config: @config).render

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
