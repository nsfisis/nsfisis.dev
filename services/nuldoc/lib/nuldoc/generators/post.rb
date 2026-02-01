module Nuldoc
  PostPage = Data.define(:root, :renderer, :site, :dest_file_path, :href,
                         :title, :description, :tags, :revisions, :published, :updated,
                         :uuid, :source_file_path)

  class GeneratorUtils
    def self.published_date(page)
      page.revisions.each do |rev|
        return rev.date unless rev.is_internal
      end
      page.revisions[0].date
    end

    def self.updated_date(page)
      page.revisions.last.date
    end

    def self.any_updates?(page)
      page.revisions.count { |rev| !rev.is_internal } >= 2
    end
  end

  module Generators
    class Post
      def initialize(doc, config)
        @doc = doc
        @config = config
      end

      def generate
        html = Pages::PostPage.new(doc: @doc, config: @config).render

        content_dir = File.join(Dir.pwd, @config.locations.content_dir)
        dest_file_path = File.join(
          @doc.source_file_path.sub(content_dir, '').sub('.md', ''),
          'index.html'
        )

        PostPage.new(
          root: html,
          renderer: :html,
          site: 'blog',
          dest_file_path: dest_file_path,
          href: dest_file_path.sub('index.html', ''),
          title: @doc.title,
          description: @doc.description,
          tags: @doc.tags,
          revisions: @doc.revisions,
          published: GeneratorUtils.published_date(@doc),
          updated: GeneratorUtils.updated_date(@doc),
          uuid: @doc.uuid,
          source_file_path: @doc.source_file_path
        )
      end
    end
  end
end
