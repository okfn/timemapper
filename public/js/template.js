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
          ${note.start} \
          {{if note.end}} \
           - ${note.end} \
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
  ',

  thread: ' \
    <div class="thread"> \
      <h2 class="title">${thread.title}</h2> \
      <p class="description">${thread.description}</p> \
      <div class="noteapp"> \
        <h2>Quick Add and Edit</h2> \
        <div id="create-note"> \
          <input id="new-note" placeholder="Add note then enter to save, use #... for tag, ^...^ for dates, @...@ for location" type="text" /> \
        </div> \
 \
        <div id="notes"> \
          <ul id="note-list"></ul> \
        </div> \
      </div> \
    </div> \
  ',
};

