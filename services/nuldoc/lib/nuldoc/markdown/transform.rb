module Nuldoc
  class Transform < DOM::HTMLBuilder
    include DOM

    def self.to_html(doc)
      new(doc).to_html
    end

    def initialize(doc)
      super()
      @doc = doc
    end

    def to_html
      merge_consecutive_text_nodes
      remove_unnecessary_text_node
      transform_link_like_to_anchor_element
      transform_section_id_attribute
      assign_section_title_anchor
      transform_section_title_element
      transform_note_element
      add_attributes_to_external_link_element
      traverse_footnotes
      remove_unnecessary_paragraph_node
      transform_and_highlight_code_block_element
      merge_consecutive_text_nodes
      generate_table_of_contents
      remove_toc_attributes
      @doc
    end

    private

    def merge_consecutive_text_nodes
      for_each_child_recursively(@doc.root) do |n|
        next unless n.kind == :element

        new_children = []
        current_text = +''

        n.children.each do |c|
          if c.kind == :text
            current_text << c.content
          else
            unless current_text.empty?
              new_children.push(text(current_text))
              current_text = +''
            end
            new_children.push(c)
          end
        end

        new_children.push(text(current_text)) unless current_text.empty?

        n.children.replace(new_children)
      end
    end

    def remove_unnecessary_text_node
      for_each_child_recursively(@doc.root) do |n|
        next unless n.kind == :element

        loop do
          changed = false
          if !n.children.empty? && n.children.first.kind == :text && n.children.first.content.strip.empty?
            n.children.shift
            changed = true
          end
          if !n.children.empty? && n.children.last.kind == :text && n.children.last.content.strip.empty?
            n.children.pop
            changed = true
          end
          break unless changed
        end
      end
    end

    def transform_link_like_to_anchor_element
      for_each_child_recursively(@doc.root) do |n|
        next unless n.kind == :element
        next if %w[a code codeblock].include?(n.name)

        process_text_nodes_in_element(n) do |content|
          nodes = []
          rest = content
          until rest.empty?
            match = %r{^(.*?)(https?://[^ \n]+)(.*)$}m.match(rest)
            unless match
              nodes.push(text(rest))
              break
            end
            nodes.push(text(match[1])) unless match[1].empty?
            nodes.push(a(href: match[2], class: 'url') { text match[2] })
            rest = match[3]
          end
          nodes
        end
      end
    end

    def transform_section_id_attribute
      section_stack = []
      used_ids = Set.new

      process_node = proc do |n|
        next unless n.kind == :element

        if n.name == 'section'
          id_attr = n.attributes['id']
          if id_attr
            new_id = if section_stack.empty?
                       "section--#{id_attr}"
                     else
                       "section--#{section_stack.join('--')}--#{id_attr}"
                     end

            raise "[nuldoc.tohtml] Duplicate section ID: #{new_id}" if used_ids.include?(new_id)

            used_ids.add(new_id)
            n.attributes['id'] = new_id
            section_stack.push(id_attr)

            for_each_child(n, &process_node)

            section_stack.pop
          else
            for_each_child(n, &process_node)
          end
        else
          for_each_child(n, &process_node)
        end
      end

      for_each_child(@doc.root, &process_node)
    end

    def assign_section_title_anchor
      section_stack = []

      g = proc do |c|
        next unless c.kind == :element

        section_stack.push(c) if c.name == 'section'
        for_each_child(c, &g)
        section_stack.pop if c.name == 'section'

        if c.name == 'h'
          current_section = section_stack.last
          raise '[nuldoc.tohtml] <h> element must be inside <section>' unless current_section

          section_id = current_section.attributes['id']
          a_element = a { child(*c.children) }
          a_element.attributes['href'] = "##{section_id}"
          c.children.replace([a_element])
        end
      end

      for_each_child(@doc.root, &g)
    end

    def transform_section_title_element
      section_level = 1

      g = proc do |parent|
        parent.children.each_with_index do |c, i|
          next unless c.kind == :element

          if c.name == 'section'
            section_level += 1
            c.attributes['__sectionLevel'] = section_level.to_s
          end
          g.call(c)
          section_level -= 1 if c.name == 'section'
          parent.children[i] = c.with(name: "h#{section_level}") if c.name == 'h'
        end
      end

      g.call(@doc.root)
    end

    def transform_note_element
      map_element_of_type(@doc.root, 'note') do |n|
        editat_attr = n.attributes['editat']
        operation_attr = n.attributes['operation']
        is_edit_block = editat_attr && operation_attr

        label_element = div class: 'admonition-label' do
          text(is_edit_block ? "#{editat_attr} #{operation_attr}" : 'NOTE')
        end
        content_element = div(class: 'admonition-content') { child(*n.children.dup) }
        add_class(n, 'admonition')
        n.children.replace([label_element, content_element])
        n.with(name: 'div')
      end
    end

    def add_attributes_to_external_link_element
      for_each_element_of_type(@doc.root, 'a') do |n|
        href = n.attributes['href'] || ''
        next unless href.start_with?('http')

        n.attributes['target'] = '_blank'
        n.attributes['rel'] = 'noreferrer'
      end
    end

    def traverse_footnotes
      footnote_counter = 0
      footnote_map = {}

      map_element_of_type(@doc.root, 'footnoteref') do |n|
        reference = n.attributes['reference']
        next n unless reference

        unless footnote_map.key?(reference)
          footnote_counter += 1
          footnote_map[reference] = footnote_counter
        end
        footnote_number = footnote_map[reference]

        n.attributes.delete('reference')
        n.attributes['class'] = 'footnote'
        n.children.replace([
                             a(id: "footnoteref--#{reference}", class: 'footnote',
                               href: "#footnote--#{reference}") do
                               text "[#{footnote_number}]"
                             end
                           ])
        n.with(name: 'sup')
      end

      map_element_of_type(@doc.root, 'footnote') do |n|
        id = n.attributes['id']
        unless id && footnote_map.key?(id)
          n.children.replace([])
          next n.with(name: 'span')
        end

        footnote_number = footnote_map[id]

        n.attributes.delete('id')
        n.attributes['class'] = 'footnote'
        n.attributes['id'] = "footnote--#{id}"

        old_children = n.children.dup
        n.children.replace([
                             a(href: "#footnoteref--#{id}") { text "#{footnote_number}. " },
                             *old_children
                           ])
        n.with(name: 'div')
      end
    end

    def remove_unnecessary_paragraph_node
      for_each_child_recursively(@doc.root) do |n|
        next unless n.kind == :element
        next unless %w[ul ol].include?(n.name)

        is_tight = n.attributes['__tight'] == 'true'
        next unless is_tight

        n.children.each do |c|
          next unless c.kind == :element && c.name == 'li'

          new_grand_children = []
          c.children.each do |grand_child|
            if grand_child.kind == :element && grand_child.name == 'p'
              new_grand_children.concat(grand_child.children)
            else
              new_grand_children.push(grand_child)
            end
          end
          c.children.replace(new_grand_children)
        end
      end
    end

    def transform_and_highlight_code_block_element
      map_children_recursively(@doc.root) do |n|
        next n unless n.kind == :element && n.name == 'codeblock'

        language = n.attributes['language'] || 'text'
        filename = n.attributes['filename']
        numbered = n.attributes['numbered']
        source_code_node = n.children[0]
        source_code = source_code_node.content.rstrip

        highlighted = highlight_code(source_code, language)

        n.attributes['class'] = 'codeblock'
        n.attributes.delete('language')

        if numbered == 'true'
          n.attributes.delete('numbered')
          add_class(n, 'numbered')
        end

        if filename
          n.attributes.delete('filename')
          n.children.replace([
                               div(class: 'filename') { text filename },
                               raw(highlighted)
                             ])
        else
          n.children.replace([raw(highlighted)])
        end
        n.with(name: 'div')
      end
    end

    def highlight_code(source, language)
      lexer = Rouge::Lexer.find(language) || Rouge::Lexers::PlainText.new
      lexer = lexer.new if lexer.is_a?(Class)
      formatter = Rouge::Formatters::HTMLInline.new('github.light')
      line_formatter = Rouge::Formatters::HTMLLinewise.new(formatter, class: 'codeblock-line')
      tokens = lexer.lex(source)
      inner_html = line_formatter.format(tokens)
      "<pre class=\"highlight\" style=\"background-color:#f5f5f5\"><code>#{inner_html.chomp.sub(/\n<\/div>\z/, '</div>')}</code></pre>"
    end

    def generate_table_of_contents
      return unless @doc.is_toc_enabled

      toc_entries = []
      stack = []
      excluded_levels = []

      process_node = proc do |node|
        next unless node.kind == :element

        match = node.name.match(/^h(\d+)$/)
        if match
          level = match[1].to_i

          parent_section = find_parent_section(@doc.root, node)
          next unless parent_section

          if parent_section.attributes['toc'] == 'false'
            excluded_levels.clear
            excluded_levels.push(level)
            next
          end

          should_exclude = excluded_levels.any? { |el| level > el }
          next if should_exclude

          excluded_levels.pop while !excluded_levels.empty? && excluded_levels.last >= level

          section_id = parent_section.attributes['id']
          next unless section_id

          heading_text = ''
          node.children.each do |c|
            heading_text = inner_text(c) if c.kind == :element && c.name == 'a'
          end

          entry = { id: section_id, text: heading_text, level: level, children: [] }

          stack.pop while !stack.empty? && stack.last[:level] >= level

          if stack.empty?
            toc_entries.push(entry)
          else
            stack.last[:children].push(entry)
          end

          stack.push(entry)
        end

        for_each_child(node, &process_node)
      end

      for_each_child(@doc.root, &process_node)

      return if toc_entries.length == 1 && toc_entries[0][:children].empty?

      toc = TocRoot.new(items: build_toc_entries(toc_entries))
      @doc.toc = toc
    end

    def build_toc_entries(raw_entries)
      raw_entries.map do |e|
        TocEntry.new(
          id: e[:id],
          text: e[:text],
          level: e[:level],
          children: build_toc_entries(e[:children])
        )
      end
    end

    def find_parent_section(root, target)
      return root if root.kind == :element && root.name == 'section' && root.children.include?(target)

      if root.kind == :element
        root.children.each do |c|
          next unless c.kind == :element

          return c if c.name == 'section' && c.children.include?(target)

          result = find_parent_section(c, target)
          return result if result
        end
      end
      nil
    end

    def remove_toc_attributes
      for_each_child_recursively(@doc.root) do |node|
        node.attributes.delete('toc') if node.kind == :element && node.name == 'section'
      end
    end
  end
end
