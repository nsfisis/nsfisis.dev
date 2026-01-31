module Nuldoc
  Config = Data.define(:locations, :site, :sites, :tag_labels) do
    def tag_label(slug)
      label = tag_labels[slug]
      raise "Unknown tag: #{slug}" if label.nil?

      label
    end

    def site_entry(site_key)
      sites.public_send(site_key)
    end
  end

  LocationsConfig = Data.define(:content_dir, :dest_dir, :static_dir)

  SiteConfig = Data.define(:author, :copyright_year)

  SiteEntry = Data.define(:fqdn, :site_name, :posts_per_page)

  SitesConfig = Data.define(:default, :about, :blog, :slides)

  class ConfigLoader
    def self.default_config_path
      File.join(Dir.pwd, 'nuldoc.toml')
    end

    def self.load_config(file_path)
      raw = TomlRB.load_file(file_path)

      locations = LocationsConfig.new(
        content_dir: raw.dig('locations', 'contentDir'),
        dest_dir: raw.dig('locations', 'destDir'),
        static_dir: raw.dig('locations', 'staticDir')
      )

      site = SiteConfig.new(
        author: raw.dig('site', 'author'),
        copyright_year: raw.dig('site', 'copyrightYear')
      )

      sites = SitesConfig.new(
        default: build_site_entry(raw.dig('sites', 'default')),
        about: build_site_entry(raw.dig('sites', 'about')),
        blog: build_site_entry(raw.dig('sites', 'blog')),
        slides: build_site_entry(raw.dig('sites', 'slides'))
      )

      Config.new(
        locations: locations,
        site: site,
        sites: sites,
        tag_labels: raw['tagLabels'] || {}
      )
    end

    def self.build_site_entry(hash)
      SiteEntry.new(
        fqdn: hash['fqdn'],
        site_name: hash['siteName'],
        posts_per_page: hash['postsPerPage']
      )
    end

    private_class_method :build_site_entry
  end
end
