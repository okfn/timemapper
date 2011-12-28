var HyperNotes = HyperNotes || {};

HyperNotes.Template = {
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
        <div class="note-list"> \
          <ul></ul> \
        </div> \
      </div> \
      <div class="span8 right-pane"> \
        {{if permissions.edit}} \
        <div class="note quick-add"> \
          <form> \
            <label for="new-note">Quick Add</label> \
            <div class="input"> \
              <input \
                name="new-note" \
                placeholder="My note title #my-tag ^1st September 1939^ @New York@" \
                type="text" /> \
            </div> \
            <span class="help-block"> \
              Add note then enter to save. Use #... for tags, ^...^ for dates, @...@ for location \
            </span> \
          </form> \
        </div> \
        {{/if}} \
        <div id="timemap"></div> \
      </div> \
    </div> \
  ',
};

