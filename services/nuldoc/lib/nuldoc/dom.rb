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

  module Dom
    module_function

    def text(content)
      Text.new(content: content)
    end

    def raw_html(html)
      RawHTML.new(html: html)
    end

    def elem(name, attributes = {}, *children)
      Element.new(
        name: name,
        attributes: attributes || {},
        children: flatten_children(children)
      )
    end

    def a(attributes = {}, *children) = elem('a', attributes, *children)
    def article(attributes = {}, *children) = elem('article', attributes, *children)
    def button(attributes = {}, *children) = elem('button', attributes, *children)
    def div(attributes = {}, *children) = elem('div', attributes, *children)
    def footer(attributes = {}, *children) = elem('footer', attributes, *children)
    def h1(attributes = {}, *children) = elem('h1', attributes, *children)
    def h2(attributes = {}, *children) = elem('h2', attributes, *children)
    def h3(attributes = {}, *children) = elem('h3', attributes, *children)
    def h4(attributes = {}, *children) = elem('h4', attributes, *children)
    def h5(attributes = {}, *children) = elem('h5', attributes, *children)
    def h6(attributes = {}, *children) = elem('h6', attributes, *children)
    def header(attributes = {}, *children) = elem('header', attributes, *children)
    def img(attributes = {}) = elem('img', attributes)
    def li(attributes = {}, *children) = elem('li', attributes, *children)
    def link(attributes = {}) = elem('link', attributes)
    def meta(attributes = {}) = elem('meta', attributes)
    def nav(attributes = {}, *children) = elem('nav', attributes, *children)
    def ol(attributes = {}, *children) = elem('ol', attributes, *children)
    def p(attributes = {}, *children) = elem('p', attributes, *children)
    def script(attributes = {}, *children) = elem('script', attributes, *children)
    def section(attributes = {}, *children) = elem('section', attributes, *children)
    def span(attributes = {}, *children) = elem('span', attributes, *children)
    def ul(attributes = {}, *children) = elem('ul', attributes, *children)

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

    def flatten_children(children)
      result = []
      children.each do |child|
        case child
        when nil, false
          next
        when String
          result.push(text(child))
        when Array
          result.concat(flatten_children(child))
        else
          result.push(child)
        end
      end
      result
    end

    module_function :flatten_children
  end
end
