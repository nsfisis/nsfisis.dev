module Nuldoc
  module Commands
    class Serve
      def self.run(config, site_name:, no_rebuild: false)
        new(config).run(site_name: site_name, no_rebuild: no_rebuild)
      end

      def initialize(config)
        @config = config
      end

      def run(site_name:, no_rebuild: false)
        raise 'Usage: nuldoc serve <site>' if site_name.nil? || site_name.empty?

        root_dir = File.join(Dir.pwd, @config.locations.dest_dir, site_name)

        server = WEBrick::HTTPServer.new(
          Port: 8000,
          BindAddress: '127.0.0.1',
          DocumentRoot: root_dir,
          Logger: WEBrick::Log.new($stderr, WEBrick::Log::INFO)
        )

        server.mount_proc '/' do |req, res|
          pathname = req.path

          unless resource_path?(pathname) || no_rebuild
            Build.run(@config)
            warn 'rebuild'
          end

          file_path = File.expand_path(File.join(root_dir, pathname))
          unless file_path.start_with?(File.realpath(root_dir))
            res.status = 403
            res.body = '403 Forbidden'
            next
          end
          file_path = File.join(file_path, 'index.html') if File.directory?(file_path)

          if File.exist?(file_path)
            res.body = File.read(file_path)
            res['Content-Type'] = WEBrick::HTTPUtils.mime_type(file_path, WEBrick::HTTPUtils::DefaultMimeTypes)
          else
            not_found_path = File.join(root_dir, '404.html')
            res.status = 404
            res.body = File.exist?(not_found_path) ? File.read(not_found_path) : '404 Not Found'
            res['Content-Type'] = 'text/html'
          end
        end

        trap('INT') { server.shutdown }
        server.start
      end

      private

      def resource_path?(pathname)
        extensions = %w[.css .gif .ico .jpeg .jpg .js .mjs .png .svg]
        extensions.any? { |ext| pathname.end_with?(ext) }
      end
    end
  end
end
