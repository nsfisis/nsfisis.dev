module Nuldoc
  Feed = Data.define(:author, :icon, :id, :link_to_self, :link_to_alternate, :title, :updated, :entries)

  FeedEntry = Data.define(:id, :link_to_alternate, :published, :summary, :title, :updated)

  module Generators
    class Atom
      BASE_NAME = 'atom.xml'.freeze

      def initialize(alternate_link, feed_slug, feed_title, entries, site, config)
        @alternate_link = alternate_link
        @feed_slug = feed_slug
        @feed_title = feed_title
        @entries = entries
        @site = site
        @config = config
      end

      def generate
        feed_entries = @entries.map do |entry|
          fqdn = entry.respond_to?(:event) ? @config.sites.slides.fqdn : @config.sites.blog.fqdn
          FeedEntry.new(
            id: "urn:uuid:#{entry.uuid}",
            link_to_alternate: "https://#{fqdn}#{entry.href}",
            title: entry.title,
            summary: entry.description,
            published: Revision.date_to_rfc3339_string(entry.published),
            updated: Revision.date_to_rfc3339_string(entry.updated)
          )
        end

        feed_entries.sort! { |a, b| [b.published, a.link_to_alternate] <=> [a.published, b.link_to_alternate] }

        site_entry = @config.site_entry(@site)
        feed_path = "#{@alternate_link}#{BASE_NAME}"

        feed = Feed.new(
          author: @config.site.author,
          icon: "https://#{site_entry.fqdn}/favicon.svg",
          id: "tag:#{site_entry.fqdn},#{@config.site.copyright_year}:#{@feed_slug}",
          link_to_self: "https://#{site_entry.fqdn}#{feed_path}",
          link_to_alternate: "https://#{site_entry.fqdn}#{@alternate_link}",
          title: @feed_title,
          updated: feed_entries.map(&:updated).max || feed_entries.first&.updated || '',
          entries: feed_entries
        )

        Page.new(
          root: Pages::AtomPage.new(feed: feed).render,
          renderer: :xml,
          site: @site,
          dest_file_path: feed_path,
          href: feed_path
        )
      end
    end
  end
end
