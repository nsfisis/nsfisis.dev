module Nuldoc
  module CLI
    extend Dry::CLI::Registry

    class BuildCommand < Dry::CLI::Command
      desc 'Build the site'

      option :profile, type: :boolean, default: false, desc: 'Profile each build step'

      def call(**options)
        config = ConfigLoader.load_config(ConfigLoader.default_config_path)
        Commands::Build.run(config, profile: options[:profile])
      end
    end

    class ServeCommand < Dry::CLI::Command
      desc 'Start development server'

      argument :site, required: true, desc: 'Site to serve (default, about, blog, slides)'
      option :no_rebuild, type: :boolean, default: false, desc: 'Skip rebuilding on each request'

      def call(site:, **options)
        config = ConfigLoader.load_config(ConfigLoader.default_config_path)
        Commands::Serve.run(config, site_name: site, no_rebuild: options[:no_rebuild])
      end
    end

    class NewCommand < Dry::CLI::Command
      desc 'Create new content'

      argument :type, required: true, desc: 'Content type (post or slide)'
      option :date, desc: 'Date (YYYY-MM-DD)'

      def call(type:, **options)
        config = ConfigLoader.load_config(ConfigLoader.default_config_path)
        Commands::New.run(config, type: type, date: options[:date])
      end
    end

    register 'build', BuildCommand
    register 'serve', ServeCommand
    register 'new', NewCommand

    def self.call
      Dry::CLI.new(self).call
    end
  end
end
