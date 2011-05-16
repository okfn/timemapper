var HyperNotes = HyperNotes || {};

HyperNotes.Template = {
  noteSummary: ' \
    <div class="note"> \
      <div class="display"> \
        <div class="note-content">${label}</div> \
        <span class="note-destroy"></span> \
      </div> \
      <div class="edit"> \
        <input class="note-input" type="text" value="${label}" name="label" /> \
      </div> \
    </div> \
  '
};

