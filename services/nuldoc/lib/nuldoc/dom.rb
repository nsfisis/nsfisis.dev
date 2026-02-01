module Nuldoc
  Text = Data.define(:content) do
    def kind = :text
  end

  RawNode = Data.define(:content) do
    def kind = :raw
  end

  Element = Data.define(:name, :attributes, :children) do
    def kind = :element
  end

  module DOM
    module_function

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

    def map_children_recursively(element, &)
      element.children.map! do |c|
        c = yield(c)
        map_children_recursively(c, &) if c.kind == :element
        c
      end
    end

    def map_element_of_type(root, element_name, &)
      map_children_recursively(root) do |n|
        if n.kind == :element && n.name == element_name
          yield(n)
        else
          n
        end
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
  end
end
