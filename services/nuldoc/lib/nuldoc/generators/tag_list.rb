module Nuldoc
  module Generators
    class TagList
      def initialize(tags, site, config)
        @tags = tags
        @site = site
        @config = config
      end

      def generate
        html = Pages::TagListPage.new(tags: @tags, site: @site, config: @config).render

        Page.new(
          root: html,
          renderer: :html,
          site: @site,
          dest_file_path: '/tags/index.html',
          href: '/tags/'
        )
      end
    end
  end
end
