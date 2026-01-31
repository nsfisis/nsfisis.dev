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

    def execute(profile: false)
      results = {}
      total_start = Process.clock_gettime(Process::CLOCK_MONOTONIC) if profile
      tsort_each do |name|
        if profile
          start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          results[name] = @steps[name].block.call(results)
          elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start
          warn format('[profile] %-30<name>s %8.3<ms>f ms', name: name, ms: elapsed * 1000)
        else
          results[name] = @steps[name].block.call(results)
        end
      end
      if profile
        total_elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - total_start
        warn format('[profile] %-30<name>s %8.3<ms>f ms', name: 'TOTAL', ms: total_elapsed * 1000)
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
