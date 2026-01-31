module Nuldoc
  module Pages
    class PostPage
      extend Dom

      def self.render(doc:, config:)
        Components::PageLayout.render(
          meta_copyright_year: GeneratorUtils.published_date(doc).year,
          meta_description: doc.description,
          meta_keywords: doc.tags.map { |slug| config.tag_label(slug) },
          meta_title: "#{doc.title}｜#{config.sites.blog.site_name}",
          site: 'blog',
          config: config,
          children: elem('body', { 'class' => 'single' },
                         Components::BlogGlobalHeader.render(config: config),
                         elem('main', { 'class' => 'main' },
                              article({ 'class' => 'post-single' },
                                      header({ 'class' => 'post-header' },
                                             h1({ 'class' => 'post-title' }, doc.title),
                                             doc.tags.length.positive? ? ul({ 'class' => 'post-tags' },
                                                                            *doc.tags.map do |slug|
                                                                              li({ 'class' => 'tag' },
                                                                                 a({ 'class' => 'tag-inner',
                                                                                     'href' => "/tags/#{slug}/" },
                                                                                   config.tag_label(slug)))
                                                                            end) : nil),
                                      if doc.toc && doc.toc.items.length.positive?
                                        Components::TableOfContents.render(toc: doc.toc)
                                      end,
                                      div({ 'class' => 'post-content' },
                                          section({ 'id' => 'changelog' },
                                                  h2({}, a({ 'href' => '#changelog' }, '更新履歴')),
                                                  ol({},
                                                     *doc.revisions.map do |rev|
                                                       ds = Revision.date_to_string(rev.date)
                                                       li({ 'class' => 'revision' },
                                                          elem('time', { 'datetime' => ds }, ds),
                                                          ": #{rev.remark}")
                                                     end)),
                                          *doc.root.children[0].children))),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
