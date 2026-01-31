require 'tsort'

module Nuldoc
  Step = Data.define(:name, :deps, :block)

  class Pipeline
    include TSort

    def initialize
      @steps = {}
    end

    def step(name, deps: [], &block)
      @steps[name] = Step.new(name: name, deps: deps, block: block)
    end

    def execute
      results = {}
      tsort_each do |name|
        results[name] = @steps[name].block.call(results)
      end
      results
    end

    private

    def tsort_each_node(&)
      @steps.each_key(&)
    end

    def tsort_each_child(name, &)
      @steps[name].deps.each(&)
    end
  end
end
