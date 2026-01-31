module Nuldoc
  module Parser
    class BlockParser
      extend Dom

      HeaderBlock = Struct.new(:level, :id, :attributes, :heading_element, keyword_init: true)
      FootnoteBlock = Struct.new(:id, :children, keyword_init: true)

      class << self
        def parse(text)
          scanner = LineScanner.new(text)
          blocks = parse_blocks(scanner)
          build_document(blocks)
        end

        private

        # --- Block parsing ---

        def parse_blocks(scanner)
          blocks = []
          until scanner.eof?
            block = parse_block(scanner)
            blocks << block if block
          end
          blocks
        end

        def parse_block(scanner)
          return nil if scanner.eof?

          line = scanner.peek

          # 1. Blank line
          if line.strip.empty?
            scanner.advance
            return nil
          end

          # 2. HTML comment
          if (result = try_html_comment(scanner))
            return result
          end

          # 3. Fenced code block
          if (result = try_fenced_code(scanner))
            return result
          end

          # 4. Note/Edit block
          if (result = try_note_block(scanner))
            return result
          end

          # 5. Heading
          if (result = try_heading(scanner))
            return result
          end

          # 6. Horizontal rule
          if (result = try_hr(scanner))
            return result
          end

          # 7. Footnote definition
          if (result = try_footnote_def(scanner))
            return result
          end

          # 8. Table
          if (result = try_table(scanner))
            return result
          end

          # 9. Blockquote
          if (result = try_blockquote(scanner))
            return result
          end

          # 10. Ordered list
          if (result = try_ordered_list(scanner))
            return result
          end

          # 11. Unordered list
          if (result = try_unordered_list(scanner))
            return result
          end

          # 12. HTML block
          if (result = try_html_block(scanner))
            return result
          end

          # 13. Paragraph
          parse_paragraph(scanner)
        end

        def try_html_comment(scanner)
          line = scanner.peek
          return nil unless line.strip.start_with?('<!--')

          content = +''
          until scanner.eof?
            l = scanner.advance
            content << l << "\n"
            break if l.include?('-->')
          end
          nil # skip comments
        end

        def try_fenced_code(scanner)
          match = scanner.match(/^```(\S*)(.*)$/)
          return nil unless match

          scanner.advance
          language = match[1].empty? ? nil : match[1]
          meta_string = match[2].strip

          attributes = {}
          attributes['language'] = language if language

          if meta_string && !meta_string.empty?
            filename_match = meta_string.match(/filename="([^"]+)"/)
            attributes['filename'] = filename_match[1] if filename_match
            attributes['numbered'] = 'true' if meta_string.include?('numbered')
          end

          code_lines = []
          until scanner.eof?
            l = scanner.peek
            if l.start_with?('```')
              scanner.advance
              break
            end
            code_lines << scanner.advance
          end

          code = code_lines.join("\n")
          elem('codeblock', attributes, text(code))
        end

        def try_note_block(scanner)
          match = scanner.match(/^:::(note|edit)(.*)$/)
          return nil unless match

          scanner.advance
          block_type = match[1]
          attr_string = match[2].strip

          attributes = {}
          if block_type == 'edit'
            # Parse {editat="..." operation="..."}
            editat_match = attr_string.match(/editat="([^"]+)"/)
            operation_match = attr_string.match(/operation="([^"]+)"/)
            attributes['editat'] = editat_match[1] if editat_match
            attributes['operation'] = operation_match[1] if operation_match
          end

          # Collect content until :::
          content_lines = []
          until scanner.eof?
            l = scanner.peek
            if l.strip == ':::'
              scanner.advance
              break
            end
            content_lines << scanner.advance
          end

          inner_text = content_lines.join("\n")
          inner_scanner = LineScanner.new(inner_text)
          children = parse_blocks(inner_scanner)

          # Convert children - they are block elements already
          child_elements = children.compact.select { |c| c.is_a?(Element) || c.is_a?(Text) || c.is_a?(RawHTML) }
          elem('note', attributes, *child_elements)
        end

        def try_heading(scanner)
          match = scanner.match(/^(\#{1,5})\s+(.+)$/)
          return nil unless match

          scanner.advance
          level = match[1].length
          raw_text = match[2]

          text_before, id, attributes = Attributes.parse_trailing_attributes(raw_text)

          inline_nodes = InlineParser.parse(text_before.strip)
          heading_element = elem('h', {}, *inline_nodes)

          HeaderBlock.new(level: level, id: id, attributes: attributes, heading_element: heading_element)
        end

        def try_hr(scanner)
          match = scanner.match(/^---+\s*$/)
          return nil unless match

          scanner.advance
          elem('hr', {})
        end

        def try_footnote_def(scanner)
          match = scanner.match(/^\[\^([^\]]+)\]:\s*(.*)$/)
          return nil unless match

          scanner.advance
          id = match[1]
          first_line = match[2]

          content_lines = [first_line]
          # Continuation lines: 4-space indent
          until scanner.eof?
            l = scanner.peek
            break unless l.start_with?('    ')

            content_lines << scanner.advance[4..]

          end

          inner_text = content_lines.join("\n").strip
          inner_scanner = LineScanner.new(inner_text)
          children = parse_blocks(inner_scanner)

          child_elements = children.compact.select { |c| c.is_a?(Element) || c.is_a?(Text) || c.is_a?(RawHTML) }
          FootnoteBlock.new(id: id, children: child_elements)
        end

        def try_table(scanner)
          # Check if this looks like a table
          return nil unless scanner.peek.start_with?('|')

          # Quick lookahead: second line must be a separator
          return nil if scanner.pos + 1 >= scanner.lines.length
          return nil unless scanner.lines[scanner.pos + 1].match?(/^\|[\s:|-]+\|$/)

          # Collect table lines
          lines = []
          while !scanner.eof? && scanner.peek.start_with?('|')
            lines << scanner.peek
            scanner.advance
          end

          header_line = lines[0]
          separator_line = lines[1]
          body_lines = lines[2..] || []

          alignment = parse_table_alignment(separator_line)
          header_cells = parse_table_row_cells(header_line)
          header_row = build_table_row(header_cells, true, alignment)

          body_rows = body_lines.map do |bl|
            cells = parse_table_row_cells(bl)
            build_table_row(cells, false, alignment)
          end

          table_children = []
          table_children << elem('thead', {}, header_row)
          table_children << elem('tbody', {}, *body_rows) unless body_rows.empty?

          elem('table', {}, *table_children)
        end

        def parse_table_alignment(separator_line)
          cells = separator_line.split('|').map(&:strip).reject(&:empty?)
          cells.map do |cell|
            left = cell.start_with?(':')
            right = cell.end_with?(':')
            if left && right
              'center'
            elsif right
              'right'
            elsif left
              'left'
            end
          end
        end

        def parse_table_row_cells(line)
          # Strip leading and trailing |, then split by |
          stripped = line.strip
          stripped = stripped[1..] if stripped.start_with?('|')
          stripped = stripped[0...-1] if stripped.end_with?('|')
          stripped.split('|').map(&:strip)
        end

        def build_table_row(cells, is_header, alignment)
          cell_elements = cells.each_with_index.map do |cell_text, i|
            attributes = {}
            align = alignment[i]
            attributes['align'] = align if align && align != 'default'

            tag = is_header ? 'th' : 'td'
            inline_nodes = InlineParser.parse(cell_text)
            elem(tag, attributes, *inline_nodes)
          end
          elem('tr', {}, *cell_elements)
        end

        def try_blockquote(scanner)
          return nil unless scanner.peek.start_with?('> ') || scanner.peek == '>'

          lines = []
          while !scanner.eof? && (scanner.peek.start_with?('> ') || scanner.peek == '>')
            line = scanner.advance
            lines << (line == '>' ? '' : line[2..])
          end

          inner_text = lines.join("\n")
          inner_scanner = LineScanner.new(inner_text)
          children = parse_blocks(inner_scanner)
          child_elements = children.compact.select { |c| c.is_a?(Element) || c.is_a?(Text) || c.is_a?(RawHTML) }

          elem('blockquote', {}, *child_elements)
        end

        def try_ordered_list(scanner)
          match = scanner.match(/^(\d+)\.\s+(.*)$/)
          return nil unless match

          items = parse_list_items(scanner, :ordered)
          return nil if items.empty?

          build_list(:ordered, items)
        end

        def try_unordered_list(scanner)
          match = scanner.match(/^\*\s+(.*)$/)
          return nil unless match

          items = parse_list_items(scanner, :unordered)
          return nil if items.empty?

          build_list(:unordered, items)
        end

        def parse_list_items(scanner, type)
          items = []
          marker_re = type == :ordered ? /^(\d+)\.\s+(.*)$/ : /^\*\s+(.*)$/
          indent_size = 4

          while !scanner.eof? && (m = scanner.match(marker_re))
            scanner.advance
            first_line = type == :ordered ? m[2] : m[1]

            content_lines = [first_line]
            has_blank = false

            # Collect continuation lines and sub-items
            until scanner.eof?
              l = scanner.peek

              # Blank line might be part of loose list
              if l.strip.empty?
                # Check if next non-blank line is still part of the list
                next_pos = scanner.pos + 1
                next_pos += 1 while next_pos < scanner.lines.length && scanner.lines[next_pos].strip.empty?

                if next_pos < scanner.lines.length
                  next_line = scanner.lines[next_pos]
                  if next_line.start_with?(' ' * indent_size) || next_line.match?(marker_re)
                    has_blank = true
                    content_lines << ''
                    scanner.advance
                    next
                  end
                end
                break
              end

              # Indented continuation (sub-items or content)
              if l.start_with?(' ' * indent_size)
                content_lines << scanner.advance[indent_size..]
                next
              end

              # New list item at same level
              break if l.match?(marker_re)

              # Non-indented, non-marker line - might be continuation of tight paragraph
              break if l.strip.empty?
              break if l.match?(/^[#>*\d]/) && !l.match?(/^\d+\.\s/) # another block element

              # Paragraph continuation
              content_lines << scanner.advance
            end

            items << { lines: content_lines, has_blank: has_blank }
          end

          items
        end

        def build_list(type, items)
          # Determine tight/loose
          is_tight = items.none? { |item| item[:has_blank] }

          attributes = {}
          attributes['__tight'] = is_tight ? 'true' : 'false'

          # Check for task list items
          is_task_list = false
          if type == :unordered
            is_task_list = items.any? { |item| item[:lines].first&.match?(/^\[[ xX]\]\s/) }
            attributes['type'] = 'task' if is_task_list
          end

          list_items = items.map do |item|
            build_list_item(item, is_task_list)
          end

          if type == :ordered
            ol(attributes, *list_items)
          else
            ul(attributes, *list_items)
          end
        end

        def build_list_item(item, is_task_list)
          attributes = {}
          content = item[:lines].join("\n")

          if is_task_list
            task_match = content.match(/^\[( |[xX])\]\s(.*)$/m)
            if task_match
              attributes['checked'] = task_match[1] == ' ' ? 'false' : 'true'
              content = task_match[2]
            end
          end

          # Parse inner content as blocks
          inner_scanner = LineScanner.new(content)
          children = parse_blocks(inner_scanner)

          # If no block-level elements were created, wrap in paragraph
          child_elements = children.compact.select { |c| c.is_a?(Element) || c.is_a?(Text) || c.is_a?(RawHTML) }
          child_elements = [p({}, *InlineParser.parse(content))] if child_elements.empty?

          li(attributes, *child_elements)
        end

        def try_html_block(scanner)
          line = scanner.peek
          match = line.match(/^<(div|details|summary)(\s[^>]*)?>/)
          return nil unless match

          tag = match[1]
          lines = []
          close_tag = "</#{tag}>"

          until scanner.eof?
            l = scanner.advance
            lines << l
            break if l.include?(close_tag)
          end

          html_content = lines.join("\n")

          if tag == 'div'
            # Parse inner content for div blocks
            inner_match = html_content.match(%r{<div([^>]*)>(.*)</div>}m)
            if inner_match
              attr_str = inner_match[1]
              inner_content = inner_match[2].strip

              attributes = {}
              attr_str.scan(/([\w-]+)="([^"]*)"/) do |key, value|
                attributes[key] = value
              end

              if inner_content.empty?
                div(attributes)
              else
                inner_scanner = LineScanner.new(inner_content)
                children = parse_blocks(inner_scanner)
                child_elements = children.compact.select { |c| c.is_a?(Element) || c.is_a?(Text) || c.is_a?(RawHTML) }
                div(attributes, *child_elements)
              end
            else
              div({ 'class' => 'raw-html' }, raw_html(html_content))
            end
          else
            div({ 'class' => 'raw-html' }, raw_html(html_content))
          end
        end

        def parse_paragraph(scanner)
          lines = []
          until scanner.eof?
            l = scanner.peek
            break if l.strip.empty?
            break if l.match?(/^```/)
            break if l.match?(/^\#{1,5}\s/)
            break if l.match?(/^---+\s*$/)
            break if l.match?(/^>\s/)
            break if l.match?(/^\*\s/)
            break if l.match?(/^\d+\.\s/)
            if l.match?(/^\|/) &&
               scanner.pos + 1 < scanner.lines.length &&
               scanner.lines[scanner.pos + 1].match?(/^\|[\s:|-]+\|$/)
              break
            end
            break if l.match?(/^:::/)
            break if l.match?(/^<!--/)
            break if l.match?(/^<(div|details|summary)/)
            break if l.match?(/^\[\^[^\]]+\]:/)

            lines << scanner.advance
          end

          return nil if lines.empty?

          text_content = lines.join("\n")
          inline_nodes = InlineParser.parse(text_content)
          p({}, *inline_nodes)
        end

        # --- Section hierarchy ---

        def build_document(blocks)
          footnote_blocks = blocks.select { |b| b.is_a?(FootnoteBlock) }
          non_footnote_blocks = blocks.reject { |b| b.is_a?(FootnoteBlock) }

          article_content = build_section_hierarchy(non_footnote_blocks)

          unless footnote_blocks.empty?
            footnote_elements = footnote_blocks.map do |fb|
              elem('footnote', { 'id' => fb.id }, *fb.children)
            end
            footnote_section = section({ 'class' => 'footnotes' }, *footnote_elements)
            article_content.push(footnote_section)
          end

          elem('__root__', {}, article({}, *article_content))
        end

        def build_section_hierarchy(blocks)
          result = []
          section_stack = []

          blocks.each do |block|
            if block.is_a?(HeaderBlock)
              level = block.level

              while !section_stack.empty? && section_stack.last[:level] >= level
                closed = section_stack.pop
                section_el = create_section_element(closed)
                if section_stack.empty?
                  result.push(section_el)
                else
                  section_stack.last[:children].push(section_el)
                end
              end

              section_stack.push({
                                   id: block.id,
                                   attributes: block.attributes,
                                   level: level,
                                   heading: block.heading_element,
                                   children: []
                                 })
            else
              next if block.nil?

              targets = if section_stack.empty?
                          result
                        else
                          section_stack.last[:children]
                        end

              if block.is_a?(Array)
                targets.concat(block)
              else
                targets.push(block)
              end
            end
          end

          until section_stack.empty?
            closed = section_stack.pop
            section_el = create_section_element(closed)
            if section_stack.empty?
              result.push(section_el)
            else
              section_stack.last[:children].push(section_el)
            end
          end

          result
        end

        def create_section_element(section_info)
          attributes = section_info[:attributes].dup
          attributes['id'] = section_info[:id] if section_info[:id]

          section(attributes, section_info[:heading], *section_info[:children])
        end
      end
    end
  end
end
