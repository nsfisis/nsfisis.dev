module Nuldoc
  TocEntry = Struct.new(:id, :text, :level, :children, keyword_init: true)

  TocRoot = Struct.new(:items, keyword_init: true)

  Document = Struct.new(
    :root,
    :source_file_path,
    :uuid,
    :link,
    :title,
    :description,
    :tags,
    :revisions,
    :toc,
    :is_toc_enabled,
    keyword_init: true
  )
end
