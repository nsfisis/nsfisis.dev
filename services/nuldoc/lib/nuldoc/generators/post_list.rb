module Nuldoc
  module Generators
    class PostList
      def initialize(posts, config)
        @posts = posts
        @config = config
      end

      def generate
        posts_per_page = @config.sites.blog.posts_per_page
        total_pages = (@posts.length.to_f / posts_per_page).ceil
        pages = []

        (0...total_pages).each do |page_index|
          page_posts = @posts[page_index * posts_per_page, posts_per_page]
          current_page = page_index + 1

          html = Pages::PostListPage.render(
            posts: page_posts,
            config: @config,
            current_page: current_page,
            total_pages: total_pages
          )

          dest_file_path = current_page == 1 ? '/posts/index.html' : "/posts/#{current_page}/index.html"
          href = current_page == 1 ? '/posts/' : "/posts/#{current_page}/"

          pages.push(Page.new(
                       root: html,
                       renderer: :html,
                       site: 'blog',
                       dest_file_path: dest_file_path,
                       href: href
                     ))
        end

        pages
      end
    end
  end
end
