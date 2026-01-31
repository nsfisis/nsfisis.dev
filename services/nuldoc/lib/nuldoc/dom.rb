module Nuldoc
  Text = Struct.new(:content, keyword_init: true) do
    def kind = :text
  end

  RawHTML = Struct.new(:html, keyword_init: true) do
    def kind = :raw
  end

  Element = Struct.new(:name, :attributes, :children, keyword_init: true) do
    def kind = :element
  end

  module DOM
    CHILDREN_STACK_KEY = :__nuldoc_dom_children_stack
    private_constant :CHILDREN_STACK_KEY

    module_function

    def text(content)
      node = Text.new(content: content)
      _auto_append(node)
      node
    end

    def raw_html(html)
      node = RawHTML.new(html: html)
      _auto_append(node)
      node
    end

    def child(*nodes)
      stack = Thread.current[CHILDREN_STACK_KEY]
      return unless stack && !stack.empty?

      nodes.each do |node|
        case node
        when nil, false
          next
        when String
          stack.last.push(Text.new(content: node))
        when Array
          node.each { |n| child(n) }
        else
          stack.last.push(node)
        end
      end
    end

    def elem(name, **attrs, &)
      children = _collect_children(&)
      node = Element.new(
        name: name,
        attributes: attrs.transform_keys(&:to_s),
        children: children
      )
      _auto_append(node)
      node
    end

    def add_class(element, klass)
      classes = element.attributes['class']
      if classes.nil?
        element.attributes['class'] = klass
      else
        class_list = classes.split
        class_list.push(klass)
        class_list.sort!
        element.attributes['class'] = class_list.join(' ')
      end
    end

    def find_first_child_element(element, name)
      element.children.find { |c| c.kind == :element && c.name == name }
    end

    def find_child_elements(element, name)
      element.children.select { |c| c.kind == :element && c.name == name }
    end

    def inner_text(element)
      t = +''
      for_each_child(element) do |c|
        t << c.content if c.kind == :text
      end
      t
    end

    def for_each_child(element, &)
      element.children.each(&)
    end

    def for_each_child_recursively(element)
      g = proc do |c|
        yield(c)
        for_each_child(c, &g) if c.kind == :element
      end
      for_each_child(element, &g)
    end

    def for_each_element_of_type(root, element_name)
      for_each_child_recursively(root) do |n|
        yield(n) if n.kind == :element && n.name == element_name
      end
    end

    def process_text_nodes_in_element(element)
      new_children = []
      element.children.each do |child|
        if child.kind == :text
          new_children.concat(yield(child.content))
        else
          new_children.push(child)
        end
      end
      element.children.replace(new_children)
    end

    private

    def _collect_children(&block)
      return [] unless block

      stack = Thread.current[CHILDREN_STACK_KEY] ||= []
      stack.push([])
      begin
        yield
        stack.last
      ensure
        stack.pop
      end
    end

    def _auto_append(node)
      stack = Thread.current[CHILDREN_STACK_KEY]
      return unless stack && !stack.empty?

      stack.last.push(node)
    end

    module_function :_collect_children, :_auto_append
  end
end
