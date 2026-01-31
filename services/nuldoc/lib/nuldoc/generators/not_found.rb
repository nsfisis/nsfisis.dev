module Nuldoc
  module Generators
    class NotFound
      def initialize(site, config)
        @site = site
        @config = config
      end

      def generate
        html = Pages::NotFoundPage.render(site: @site, config: @config)

        Page.new(
          root: html,
          renderer: :html,
          site: @site,
          dest_file_path: '/404.html',
          href: '/404.html'
        )
      end
    end
  end
end
