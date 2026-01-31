module Nuldoc
  module Pages
    class TagPage
      extend Dom

      def self.render(tag_slug:, pages:, site:, config:)
        tag_label = config.tag_label(tag_slug)
        page_title = "タグ「#{tag_label}」一覧"

        global_header = site == 'blog' ? Components::BlogGlobalHeader : Components::SlidesGlobalHeader
        site_entry = config.site_entry(site)

        Components::PageLayout.render(
          meta_copyright_year: GeneratorUtils.published_date(pages.last).year,
          meta_description: "タグ「#{tag_label}」のついた記事またはスライドの一覧",
          meta_keywords: [tag_label],
          meta_title: "#{page_title}｜#{site_entry.site_name}",
          meta_atom_feed_href: "https://#{site_entry.fqdn}/tags/#{tag_slug}/atom.xml",
          site: site,
          config: config,
          children: elem('body', { 'class' => 'list' },
                         global_header.render(config: config),
                         elem('main', { 'class' => 'main' },
                              header({ 'class' => 'page-header' }, h1({}, page_title)),
                              *pages.map do |page|
                                if page.respond_to?(:event)
                                  Components::SlidePageEntry.render(slide: page, config: config)
                                else
                                  Components::PostPageEntry.render(post: page, config: config)
                                end
                              end),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
