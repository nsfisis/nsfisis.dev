module Nuldoc
  module Pages
    class TagListPage
      extend Dom

      def self.render(tags:, site:, config:)
        page_title = 'タグ一覧'
        global_header = site == 'blog' ? Components::BlogGlobalHeader : Components::SlidesGlobalHeader
        site_entry = config.site_entry(site)

        sorted_tags = tags.sort_by(&:tag_slug)

        Components::PageLayout.render(
          meta_copyright_year: config.site.copyright_year,
          meta_description: 'タグの一覧',
          meta_title: "#{page_title}｜#{site_entry.site_name}",
          site: site,
          config: config,
          children: elem('body', { 'class' => 'list' },
                         global_header.render(config: config),
                         elem('main', { 'class' => 'main' },
                              header({ 'class' => 'page-header' }, h1({}, page_title)),
                              *sorted_tags.map do |tag|
                                posts_text = tag.num_of_posts.zero? ? '' : "#{tag.num_of_posts}件の記事"
                                slides_text = tag.num_of_slides.zero? ? '' : "#{tag.num_of_slides}件のスライド"
                                separator = !posts_text.empty? && !slides_text.empty? ? '、' : ''
                                footer_text = "#{posts_text}#{separator}#{slides_text}"

                                article({ 'class' => 'post-entry' },
                                        a({ 'href' => tag.href },
                                          header({ 'class' => 'entry-header' }, h2({}, tag.tag_label)),
                                          footer({ 'class' => 'entry-footer' }, footer_text)))
                              end),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
