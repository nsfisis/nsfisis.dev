module Nuldoc
  module Pages
    class PostListPage
      extend Dom

      def self.render(posts:, config:, current_page:, total_pages:)
        page_title = '投稿一覧'
        page_info_suffix = " (#{current_page}ページ目)"
        meta_title = "#{page_title}#{page_info_suffix}｜#{config.sites.blog.site_name}"
        meta_description = "投稿した記事の一覧#{page_info_suffix}"

        Components::PageLayout.render(
          meta_copyright_year: config.site.copyright_year,
          meta_description: meta_description,
          meta_title: meta_title,
          meta_atom_feed_href: "https://#{config.sites.blog.fqdn}/posts/atom.xml",
          site: 'blog',
          config: config,
          children: elem('body', { 'class' => 'list' },
                         Components::BlogGlobalHeader.render(config: config),
                         elem('main', { 'class' => 'main' },
                              header({ 'class' => 'page-header' },
                                     h1({}, "#{page_title}#{page_info_suffix}")),
                              Components::Pagination.render(current_page: current_page, total_pages: total_pages,
                                                            base_path: '/posts/'),
                              *posts.map { |post| Components::PostPageEntry.render(post: post, config: config) },
                              Components::Pagination.render(current_page: current_page, total_pages: total_pages,
                                                            base_path: '/posts/')),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
