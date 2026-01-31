module Nuldoc
  module Components
    class PageLayout
      extend DOM::HTML

      def self.render(meta_copyright_year:, meta_description:, meta_title:, site:, config:, children:,
                      meta_keywords: nil, meta_atom_feed_href: nil)
        site_entry = config.site_entry(site)

        html(lang: 'ja-JP') do
          head do
            meta(charset: 'UTF-8')
            meta(name: 'viewport', content: 'width=device-width, initial-scale=1.0')
            meta(name: 'author', content: config.site.author)
            meta(name: 'copyright', content: "&copy; #{meta_copyright_year} #{config.site.author}")
            meta(name: 'description', content: meta_description)
            meta(name: 'keywords', content: meta_keywords.join(',')) if meta_keywords && !meta_keywords.empty?
            meta(property: 'og:type', content: 'article')
            meta(property: 'og:title', content: meta_title)
            meta(property: 'og:description', content: meta_description)
            meta(property: 'og:site_name', content: site_entry.site_name)
            meta(property: 'og:locale', content: 'ja_JP')
            meta(name: 'Hatena::Bookmark', content: 'nocomment')
            link(rel: 'alternate', href: meta_atom_feed_href, type: 'application/atom+xml') if meta_atom_feed_href
            link(rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml')
            title { text meta_title }
            StaticStylesheet.render(file_name: '/style.css', config: config)
          end
          child children
        end
      end
    end
  end
end
