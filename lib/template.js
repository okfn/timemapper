var HyperNotes = HyperNotes || {};

HyperNotes.Template = {
  noteSummary: ' \
    <div class="note-summary"> \
      <div class="display"> \
        <div class="action"> \
          <span class="note-destroy"></span> \
        </div> \
        <h3 class="title"> \
          ${note.title} \
        </h3> \
        <div class="location"> \
          {{if note.location.unparsed}} \
          @${note.location.unparsed} \
          {{/if}} \
        </div> \
        <div class="temporal"> \
          ${note.start.unparsed} \
          {{if note.end.unparsed }} \
           - ${note.end.unparsed} \
          {{/if}} \
        </div> \
        <div class="tags"> \
          {{if note.tags.length}} \
          <ul class="tags"> \
            {{each note.tags}} \
              <li>${$value}</li> \
            {{/each}} \
          </ul> \
          {{/if}} \
        </div> \
      </div> \
      <div class="edit"> \
        <input class="note-input" type="text" value="${label}" name="label" /> \
      </div> \
    </div> \
  ',

  timeMap: ' \
      <div id="timelinecontainer"> \
        <div id="timeline"></div> \
      </div> \
      <div id="mapcontainer"> \
        <div id="map"></div> \
      </div> \
  '
};

