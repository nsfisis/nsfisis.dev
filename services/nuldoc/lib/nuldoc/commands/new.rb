module Nuldoc
  module Commands
    class New
      def self.run(config, type:, date: nil)
        new(config).run(type: type, date: date)
      end

      def initialize(config)
        @config = config
      end

      def run(type:, date: nil)
        unless %w[post slide].include?(type)
          warn <<~USAGE
            Usage: nuldoc new <type>

            <type> must be either "post" or "slide".

            OPTIONS:
              --date <DATE>
          USAGE
          exit 1
        end

        ymd = date || Time.now.strftime('%Y-%m-%d')

        dir_path = type == 'post' ? 'posts' : 'slides'
        filename = type == 'post' ? 'TODO.md' : 'TODO.toml'

        dest_file_path = File.join(Dir.pwd, @config.locations.content_dir, dir_path, ymd, filename)
        FileUtils.mkdir_p(File.dirname(dest_file_path))
        File.write(dest_file_path, template(type, ymd))

        relative = dest_file_path.sub(Dir.pwd, '')
        puts "New file #{relative} was successfully created."
      end

      private

      def template(type, date)
        uuid = SecureRandom.uuid
        if type == 'post'
          <<~TEMPLATE
            ---
            [article]
            uuid = "#{uuid}"
            title = "TODO"
            description = "TODO"
            tags = [
              "TODO",
            ]

            [[article.revisions]]
            date = "#{date}"
            remark = "公開"
            ---
            # はじめに {#intro}

            TODO
          TEMPLATE
        else
          <<~TEMPLATE
            [slide]
            uuid = "#{uuid}"
            title = "TODO"
            event = "TODO"
            talkType = "TODO"
            link = "TODO"
            tags = [
              "TODO",
            ]

            [[slide.revisions]]
            date = "#{date}"
            remark = "登壇"
          TEMPLATE
        end
      end
    end
  end
end
