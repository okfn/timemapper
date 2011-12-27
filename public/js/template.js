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
        <div class="description snippet"> \
          ${note.description} \
        </div> \
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
    <h1 class="title">${thread.title}</h1> \
    <div class="thread-info"> \
      <p class="description snippet">${thread.description}</p> \
    </div> \
    <div class="row"> \
      <div class="span8 left-pane"> \
        <div class="noteapp"> \
          <div id="notes"> \
            <ul id="note-list"></ul> \
          </div> \
        </div> \
      </div> \
      <div class="span8 right-pane"> \
        <div class="note quick-add"> \
          <h3>Quick Add</h3> \
          <div class="create-note"> \
            <input id="new-note" placeholder="Add note then enter to save, use #... for tag, ^...^ for dates, @...@ for location" type="text" /> \
          </div> \
        </div> \
        <div id="timemap"></div> \
      </div> \
    </div> \
  ',
};

