module Nuldoc
  SlidePageData = Data.define(:root, :renderer, :site, :dest_file_path, :href,
                              :title, :description, :event, :talk_type, :slide_link,
                              :tags, :revisions, :published, :updated, :uuid)

  module Generators
    class Slide
      def initialize(slide, config)
        @slide = slide
        @config = config
      end

      def generate
        html = Pages::SlidePage.render(slide: @slide, config: @config)

        content_dir = File.join(Dir.pwd, @config.locations.content_dir)
        dest_file_path = File.join(
          @slide.source_file_path.sub(content_dir, '').sub('.toml', ''),
          'index.html'
        )

        SlidePageData.new(
          root: html,
          renderer: :html,
          site: 'slides',
          dest_file_path: dest_file_path,
          href: dest_file_path.sub('index.html', ''),
          title: @slide.title,
          description: "#{@slide.event} (#{@slide.talk_type})",
          event: @slide.event,
          talk_type: @slide.talk_type,
          slide_link: @slide.slide_link,
          tags: @slide.tags,
          revisions: @slide.revisions,
          published: GeneratorUtils.published_date(@slide),
          updated: GeneratorUtils.updated_date(@slide),
          uuid: @slide.uuid
        )
      end
    end
  end
end
