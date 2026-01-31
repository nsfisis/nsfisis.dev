module Nuldoc
  module Pages
    class PostPage
      extend DOM::HTML

      def self.render(doc:, config:)
        Components::PageLayout.render(
          meta_copyright_year: GeneratorUtils.published_date(doc).year,
          meta_description: doc.description,
          meta_keywords: doc.tags.map { |slug| config.tag_label(slug) },
          meta_title: "#{doc.title}｜#{config.sites.blog.site_name}",
          site: 'blog',
          config: config,
          children: body(class: 'single') do
            Components::BlogGlobalHeader.render(config: config)
            main(class: 'main') do
              article(class: 'post-single') do
                header(class: 'post-header') do
                  h1(class: 'post-title') { text doc.title }
                  if doc.tags.length.positive?
                    ul(class: 'post-tags') do
                      doc.tags.each do |slug|
                        li(class: 'tag') do
                          a(class: 'tag-inner', href: "/tags/#{slug}/") { text config.tag_label(slug) }
                        end
                      end
                    end
                  end
                end
                Components::TableOfContents.render(toc: doc.toc) if doc.toc && doc.toc.items.length.positive?
                div(class: 'post-content') do
                  section(id: 'changelog') do
                    h2 { a(href: '#changelog') { text '更新履歴' } }
                    ol do
                      doc.revisions.each do |rev|
                        ds = Revision.date_to_string(rev.date)
                        li(class: 'revision') do
                          time(datetime: ds) { text ds }
                          text ": #{rev.remark}"
                        end
                      end
                    end
                  end
                  child(*doc.root.children[0].children)
                end
              end
            end
            Components::GlobalFooter.render(config: config)
          end
        )
      end
    end
  end
end
