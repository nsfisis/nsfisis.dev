module Nuldoc
  TagPageData = Data.define(:root, :renderer, :site, :dest_file_path, :href,
                            :tag_slug, :tag_label, :num_of_posts, :num_of_slides)

  module Generators
    class Tag
      def initialize(tag_slug, pages, site, config)
        @tag_slug = tag_slug
        @pages = pages
        @site = site
        @config = config
      end

      def generate
        html = Pages::TagPage.new(tag_slug: @tag_slug, pages: @pages, site: @site, config: @config).render

        TagPageData.new(
          root: html,
          renderer: :html,
          site: @site,
          dest_file_path: "/tags/#{@tag_slug}/index.html",
          href: "/tags/#{@tag_slug}/",
          tag_slug: @tag_slug,
          tag_label: @config.tag_label(@tag_slug),
          num_of_posts: @pages.count { |p| !p.respond_to?(:event) },
          num_of_slides: @pages.count { |p| p.respond_to?(:event) }
        )
      end
    end
  end
end
