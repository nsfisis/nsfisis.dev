module Nuldoc
  module DOM
    module HTML
      def self.extended(base)
        base.extend(DOM)
      end

      def self.included(base)
        base.include(DOM)
      end

      module_function

      def a(**attrs, &) = DOM.elem('a', **attrs, &)
      def article(**attrs, &) = DOM.elem('article', **attrs, &)
      def blockquote(**attrs, &) = DOM.elem('blockquote', **attrs, &)
      def body(**attrs, &) = DOM.elem('body', **attrs, &)
      def button(**attrs, &) = DOM.elem('button', **attrs, &)
      def canvas(**attrs, &) = DOM.elem('canvas', **attrs, &)
      def code(**attrs, &) = DOM.elem('code', **attrs, &)
      def del(**attrs, &) = DOM.elem('del', **attrs, &)
      def div(**attrs, &) = DOM.elem('div', **attrs, &)
      def em(**attrs, &) = DOM.elem('em', **attrs, &)
      def footer(**attrs, &) = DOM.elem('footer', **attrs, &)
      def h1(**attrs, &) = DOM.elem('h1', **attrs, &)
      def h2(**attrs, &) = DOM.elem('h2', **attrs, &)
      def h3(**attrs, &) = DOM.elem('h3', **attrs, &)
      def h4(**attrs, &) = DOM.elem('h4', **attrs, &)
      def h5(**attrs, &) = DOM.elem('h5', **attrs, &)
      def h6(**attrs, &) = DOM.elem('h6', **attrs, &)
      def head(**attrs, &) = DOM.elem('head', **attrs, &)
      def header(**attrs, &) = DOM.elem('header', **attrs, &)
      def hr(**attrs) = DOM.elem('hr', **attrs)
      def html(**attrs, &) = DOM.elem('html', **attrs, &)
      def img(**attrs) = DOM.elem('img', **attrs)
      def li(**attrs, &) = DOM.elem('li', **attrs, &)
      def link(**attrs) = DOM.elem('link', **attrs)
      def main(**attrs, &) = DOM.elem('main', **attrs, &)
      def meta(**attrs) = DOM.elem('meta', **attrs)
      def nav(**attrs, &) = DOM.elem('nav', **attrs, &)
      def ol(**attrs, &) = DOM.elem('ol', **attrs, &)
      def p(**attrs, &) = DOM.elem('p', **attrs, &)
      def script(**attrs, &) = DOM.elem('script', **attrs, &)
      def section(**attrs, &) = DOM.elem('section', **attrs, &)
      def span(**attrs, &) = DOM.elem('span', **attrs, &)
      def strong(**attrs, &) = DOM.elem('strong', **attrs, &)
      def table(**attrs, &) = DOM.elem('table', **attrs, &)
      def tbody(**attrs, &) = DOM.elem('tbody', **attrs, &)
      def thead(**attrs, &) = DOM.elem('thead', **attrs, &)
      def time(**attrs, &) = DOM.elem('time', **attrs, &)
      def title(**attrs, &) = DOM.elem('title', **attrs, &)
      def tr(**attrs, &) = DOM.elem('tr', **attrs, &)
      def ul(**attrs, &) = DOM.elem('ul', **attrs, &)
    end
  end
end
