module Nuldoc
  module Pages
    class PostListPage
      def initialize(posts:, config:, current_page:, total_pages:)
        @posts = posts
        @config = config
        @current_page = current_page
        @total_pages = total_pages
      end

      def render
        posts = @posts
        config = @config
        current_page = @current_page
        total_pages = @total_pages
        page_title = '投稿一覧'
        page_info_suffix = " (#{current_page}ページ目)"
        meta_title = "#{page_title}#{page_info_suffix}｜#{config.sites.blog.site_name}"
        meta_description = "投稿した記事の一覧#{page_info_suffix}"

        Components::PageLayout.new(
          meta_copyright_year: config.site.copyright_year,
          meta_description: meta_description,
          meta_title: meta_title,
          meta_atom_feed_href: "https://#{config.sites.blog.fqdn}/posts/atom.xml",
          site: 'blog',
          config: config,
          children: DOM::HTMLBuilder.new.build do
            body class: 'list' do
              render Components::BlogGlobalHeader, config: config
              main class: 'main' do
                header(class: 'page-header') { h1 { text "#{page_title}#{page_info_suffix}" } }
                render Components::Pagination, current_page: current_page, total_pages: total_pages,
                                               base_path: '/posts/'
                posts.each { |post| render(Components::PostPageEntry, post: post, config: config) }
                render Components::Pagination, current_page: current_page, total_pages: total_pages,
                                               base_path: '/posts/'
              end
              render Components::GlobalFooter, config: config
            end
          end
        ).build
      end
    end
  end
end
