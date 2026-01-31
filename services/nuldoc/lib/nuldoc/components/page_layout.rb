module Nuldoc
  module Components
    class PageLayout
      extend Dom

      def self.render(meta_copyright_year:, meta_description:, meta_title:, site:, config:, children:,
                      meta_keywords: nil, meta_atom_feed_href: nil)
        site_entry = config.site_entry(site)

        elem('html', { 'lang' => 'ja-JP' },
             elem('head', {},
                  meta({ 'charset' => 'UTF-8' }),
                  meta({ 'name' => 'viewport', 'content' => 'width=device-width, initial-scale=1.0' }),
                  meta({ 'name' => 'author', 'content' => config.site.author }),
                  meta({ 'name' => 'copyright',
                         'content' => "&copy; #{meta_copyright_year} #{config.site.author}" }),
                  meta({ 'name' => 'description', 'content' => meta_description }),
                  meta_keywords && !meta_keywords.empty? ? meta({ 'name' => 'keywords',
                                                                  'content' => meta_keywords.join(',') }) : nil,
                  meta({ 'property' => 'og:type', 'content' => 'article' }),
                  meta({ 'property' => 'og:title', 'content' => meta_title }),
                  meta({ 'property' => 'og:description', 'content' => meta_description }),
                  meta({ 'property' => 'og:site_name', 'content' => site_entry.site_name }),
                  meta({ 'property' => 'og:locale', 'content' => 'ja_JP' }),
                  meta({ 'name' => 'Hatena::Bookmark', 'content' => 'nocomment' }),
                  meta_atom_feed_href ? link({ 'rel' => 'alternate', 'href' => meta_atom_feed_href,
                                               'type' => 'application/atom+xml' }) : nil,
                  link({ 'rel' => 'icon', 'href' => '/favicon.svg', 'type' => 'image/svg+xml' }),
                  elem('title', {}, meta_title),
                  StaticStylesheet.render(file_name: '/style.css', config: config)),
             children)
      end
    end
  end
end
