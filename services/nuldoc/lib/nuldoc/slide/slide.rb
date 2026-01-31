module Nuldoc
  Slide = Data.define(
    :source_file_path,
    :uuid,
    :title,
    :event,
    :talk_type,
    :slide_link,
    :tags,
    :revisions
  )

  class SlideFactory
    def initialize(metadata, source_file_path)
      @metadata = metadata
      @source_file_path = source_file_path
    end

    def create
      slide_data = @metadata['slide']
      revisions = slide_data['revisions'].each_with_index.map do |rev, i|
        Revision.new(
          number: i + 1,
          date: Revision.string_to_date(rev['date']),
          remark: rev['remark'],
          is_internal: !rev['isInternal'].nil?
        )
      end

      raise "[slide.new] 'slide.revisions' field is empty" if revisions.empty?

      Slide.new(
        source_file_path: @source_file_path,
        uuid: slide_data['uuid'],
        title: slide_data['title'],
        event: slide_data['event'],
        talk_type: slide_data['talkType'],
        slide_link: slide_data['link'],
        tags: slide_data['tags'],
        revisions: revisions
      )
    end
  end
end
