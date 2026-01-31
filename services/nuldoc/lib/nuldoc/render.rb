module Nuldoc
  class Renderer
    def render(root, renderer_type)
      case renderer_type
      when :html
        HTMLRenderer.new.render(root)
      when :xml
        XMLRenderer.new.render(root)
      else
        raise "Unknown renderer: #{renderer_type}"
      end
    end
  end
end
