module Nuldoc
  class MarkdownParser
    def initialize(file_path, config)
      @file_path = file_path
      @config = config
    end

    def parse
      file_content = File.read(@file_path)
      _, frontmatter, *rest = file_content.split(/^---$/m)
      meta = parse_metadata(frontmatter)
      content = rest.join('---')

      dom_root = Parser::BlockParser.parse(content)
      content_dir = File.join(Dir.pwd, @config.locations.content_dir)
      link_path = @file_path.sub(content_dir, '').sub('.md', '/')

      revisions = meta['article']['revisions'].each_with_index.map do |r, i|
        Revision.new(
          number: i,
          date: Revision.string_to_date(r['date']),
          remark: r['remark'],
          is_internal: !r['isInternal'].nil?
        )
      end

      doc = Document.new(
        root: dom_root,
        source_file_path: @file_path,
        uuid: meta['article']['uuid'],
        link: link_path,
        title: meta['article']['title'],
        description: meta['article']['description'],
        tags: meta['article']['tags'],
        revisions: revisions,
        toc: nil,
        is_toc_enabled: meta['article']['toc'] != false
      )

      Transform.to_html(doc)
    rescue StandardError => e
      raise e.class, "#{e.message} in #{@file_path}"
    end

    private

    def parse_metadata(s)
      TomlRB.parse(s)
    end
  end
end
