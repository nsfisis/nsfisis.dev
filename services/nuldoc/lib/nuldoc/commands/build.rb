module Nuldoc
  module Commands
    class Build
      def self.run(config, profile: false)
        new(config, profile: profile).run
      end

      def initialize(config, profile: false)
        @config = config
        @profile = profile
      end

      def run
        pipeline = Pipeline.new

        pipeline.step(:build_posts) { build_post_pages }
        pipeline.step(:build_post_list, deps: [:build_posts]) { |r| build_post_list_page(r[:build_posts]) }
        pipeline.step(:build_blog_tags, deps: [:build_posts]) { |r| build_tag_pages(r[:build_posts], 'blog') }
        pipeline.step(:build_blog_tag_list, deps: [:build_blog_tags]) do |r|
          build_tag_list_page(r[:build_blog_tags], 'blog')
        end
        pipeline.step(:copy_post_sources, deps: [:build_posts]) { |r| copy_post_source_files(r[:build_posts]) }

        pipeline.step(:build_slides) { build_slide_pages }
        pipeline.step(:build_slide_list, deps: [:build_slides]) { |r| build_slide_list_page(r[:build_slides]) }
        pipeline.step(:build_slide_tags, deps: [:build_slides]) { |r| build_tag_pages(r[:build_slides], 'slides') }
        pipeline.step(:build_slide_tag_list, deps: [:build_slide_tags]) do |r|
          build_tag_list_page(r[:build_slide_tags], 'slides')
        end
        pipeline.step(:build_about, deps: [:build_slides]) { |r| build_about_page(r[:build_slides]) }
        pipeline.step(:copy_slides_files, deps: [:build_slides]) { |r| copy_slides_files(r[:build_slides]) }

        pipeline.step(:build_home) { build_home_page }
        pipeline.step(:build_not_found) { %w[default about blog slides].each { |site| build_not_found_page(site) } }
        pipeline.step(:copy_static) { copy_static_files }
        pipeline.step(:copy_blog_assets) { copy_blog_asset_files }
        pipeline.step(:copy_slides_assets) { copy_slides_asset_files }

        pipeline.execute(profile: @profile)
      end

      private

      def build_post_pages
        source_dir = File.join(Dir.pwd, @config.locations.content_dir, 'posts')
        post_files = Dir.glob(File.join(source_dir, '**', '*.md'))
        posts = post_files.map do |file|
          doc = MarkdownParser.new(file, @config).parse
          Generators::Post.new(doc, @config).generate
        end
        posts.each { |post| write_page(post) }
        posts
      end

      def build_post_list_page(posts)
        sorted_posts = posts.sort do |a, b|
          [GeneratorUtils.published_date(b), a.href] <=> [GeneratorUtils.published_date(a), b.href]
        end

        post_list_pages = Generators::PostList.new(sorted_posts, @config).generate
        post_list_pages.each { |page| write_page(page) }

        post_feed = Generators::Atom.new(
          '/posts/', 'posts',
          "投稿一覧｜#{@config.sites.blog.site_name}",
          posts, 'blog', @config
        ).generate
        write_page(post_feed)
      end

      def build_slide_pages
        source_dir = File.join(Dir.pwd, @config.locations.content_dir, 'slides')
        slide_files = Dir.glob(File.join(source_dir, '**', '*.toml'))
        slides = slide_files.map do |file|
          slide = SlideParser.new(file).parse
          Generators::Slide.new(slide, @config).generate
        end
        slides.each { |slide| write_page(slide) }
        slides
      end

      def build_slide_list_page(slides)
        slide_list_page = Generators::SlideList.new(slides, @config).generate
        write_page(slide_list_page)

        slide_feed = Generators::Atom.new(
          slide_list_page.href, 'slides',
          "スライド一覧｜#{@config.sites.slides.site_name}",
          slides, 'slides', @config
        ).generate
        write_page(slide_feed)
      end

      def build_home_page
        write_page(Generators::Home.new(@config).generate)
      end

      def build_about_page(slides)
        staff_file = File.join(Dir.pwd, @config.locations.content_dir, 'about', 'staff.toml')
        staff_records = StaffParser.new(staff_file).parse
        write_page(Generators::About.new(slides, staff_records, @config).generate)
      end

      def build_not_found_page(site)
        write_page(Generators::NotFound.new(site, @config).generate)
      end

      def build_tag_pages(pages, site)
        tags_and_pages = collect_tags(pages)
        tags = []
        tags_and_pages.each do |tag, tag_pages|
          tag_page = Generators::Tag.new(tag, tag_pages, site, @config).generate
          write_page(tag_page)

          tag_feed = Generators::Atom.new(
            tag_page.href, "tag-#{tag}",
            "タグ「#{@config.tag_label(tag)}」一覧｜#{@config.site_entry(site).site_name}",
            tag_pages, site, @config
          ).generate
          write_page(tag_feed)
          tags.push(tag_page)
        end
        tags
      end

      def build_tag_list_page(tags, site)
        write_page(Generators::TagList.new(tags, site, @config).generate)
      end

      def collect_tags(tagged_pages)
        tags_and_pages = {}
        tagged_pages.each do |page|
          page.tags.each do |tag|
            tags_and_pages[tag] ||= []
            tags_and_pages[tag].push(page)
          end
        end

        tags_and_pages.sort_by { |tag, _| tag }.map do |tag, pages|
          sorted_pages = pages.sort do |a, b|
            [GeneratorUtils.published_date(b), a.href] <=> [GeneratorUtils.published_date(a), b.href]
          end
          [tag, sorted_pages]
        end
      end

      def copy_static_files
        static_dir = File.join(Dir.pwd, @config.locations.static_dir)

        %w[default about blog slides].each do |site|
          dest_dir = File.join(Dir.pwd, @config.locations.dest_dir, site)

          Dir.glob(File.join(static_dir, '_all', '*')).each do |entry|
            next unless File.file?(entry)

            FileUtils.cp(entry, File.join(dest_dir, File.basename(entry)))
          end

          Dir.glob(File.join(static_dir, site, '*')).each do |entry|
            next unless File.file?(entry)

            FileUtils.cp(entry, File.join(dest_dir, File.basename(entry)))
          end
        end
      end

      def copy_slides_files(slides)
        content_dir = File.join(Dir.pwd, @config.locations.content_dir)
        dest_dir = File.join(Dir.pwd, @config.locations.dest_dir)

        slides.each do |slide|
          src = File.join(content_dir, slide.slide_link)
          dst = File.join(dest_dir, 'slides', slide.slide_link)
          FileUtils.mkdir_p(File.dirname(dst))
          FileUtils.cp(src, dst)
        end
      end

      def copy_blog_asset_files
        content_dir = File.join(Dir.pwd, @config.locations.content_dir, 'posts')
        dest_dir = File.join(Dir.pwd, @config.locations.dest_dir, 'blog')

        Dir.glob(File.join(content_dir, '**', '*')).each do |path|
          next unless File.file?(path)
          next if path.end_with?('.md', '.toml', '.pdf')

          relative = path.sub("#{content_dir}/", '')
          dst = File.join(dest_dir, 'posts', relative)
          FileUtils.mkdir_p(File.dirname(dst))
          FileUtils.cp(path, dst)
        end
      end

      def copy_slides_asset_files
        content_dir = File.join(Dir.pwd, @config.locations.content_dir, 'slides')
        dest_dir = File.join(Dir.pwd, @config.locations.dest_dir, 'slides')

        Dir.glob(File.join(content_dir, '**', '*')).each do |path|
          next unless File.file?(path)
          next if path.end_with?('.md', '.toml', '.pdf')

          relative = path.sub("#{content_dir}/", '')
          dst = File.join(dest_dir, 'slides', relative)
          FileUtils.mkdir_p(File.dirname(dst))
          FileUtils.cp(path, dst)
        end
      end

      def write_page(page)
        dest_file_path = File.join(Dir.pwd, @config.locations.dest_dir, page.site, page.dest_file_path)
        FileUtils.mkdir_p(File.dirname(dest_file_path))
        File.write(dest_file_path, Renderer.new.render(page.root, page.renderer))
      end

      def copy_post_source_files(posts)
        content_dir = File.join(Dir.pwd, @config.locations.content_dir)
        dest_dir = File.join(Dir.pwd, @config.locations.dest_dir, 'blog')

        posts.each do |post|
          src = post.source_file_path
          relative = src.sub("#{content_dir}/", '')
          dst = File.join(dest_dir, relative)
          FileUtils.mkdir_p(File.dirname(dst))
          FileUtils.cp(src, dst)
        end
      end
    end
  end
end
