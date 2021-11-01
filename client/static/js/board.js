'use strict';
const socket = io()
const board_id = window.location.href.split('/')[3]
let notes = []
const tempQuadrant = {important: 0, urgent: 0}

document.addEventListener('DOMContentLoaded', () => {
  const stickyArea = document.querySelector(
    '#stickies-container'
  );

  const createStickyButton = document.querySelector(
    '#createsticky'
  );

  const stickyTitleInput = document.querySelector('#stickytitle');
  const stickyTextInput = document.querySelector('#stickytext');

  // socket.io functions
  const sendCreateNote = () => {
    // create a note and send it
    // here we have access to title and text field
    const title = stickyTitleInput.value
    const text = stickyTextInput.value
    const note = { title, text, tempQuadrant }
    createNote(board_id, note).then(newNote => {
      socket.emit('note created', {note: newNote, board_id})
      createSticky(newNote._id)
    })
  }
  const sendUpdateNote = (note) => {
    socket.emit('note update', {note, board_id})
  }
  const sendDeleteNote = (note_id) => {
    socket.emit('note delete', {note_id, board_id})
  }
  
  const receiveCreatedNote = ({note, io_board_id}) => {
    if (io_board_id === board_id) {
      loadSticky(note._id, note.title, note.text)
    } else {
      console.log('wrong', io_board_id, board_id)
    }
    console.log('at least')
  }
  const receiveUpdatedNote = ({note, io_board_id}) => {
    if (io_board_id === board_id) {
      // update note here LOL
    }
  }
  const receiveDeleteNote = ({note_id, io_board_id}) => {
    if (io_board_id === board_id) {
      // delete the note
    }
  }

  socket.on('receive note', ({note, io_board_id}) => {
    console.log(note, io_board_id)
    receiveCreatedNote({note, io_board_id})
  })

  const deleteSticky = e => {
    e.target.parentNode.remove();
  };

  let isDragging = false;
  let dragTarget;

  let lastOffsetX = 0;
  let lastOffsetY = 0;

  function drag(e) {
    if (!isDragging) return;

    // console.log(lastOffsetX);

    dragTarget.style.left = e.clientX - lastOffsetX + 'px';
    dragTarget.style.top = e.clientY - lastOffsetY + 'px';
  }

  function createSticky(note_id) {
    const newSticky = document.createElement('div');
    newSticky.setAttribute('id', note_id)
    const html = `<h3>${stickyTitleInput.value.replace(
      /<\/?[^>]+(>|$)/g,
      ''
    )}</h3><p>${stickyTextInput.value
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(
      /\r\n|\r|\n/g,
      '<br />'
    )}</p><span class="deletesticky">&times;</span>`;
    newSticky.classList.add('drag', 'sticky');
    newSticky.innerHTML = html;
    // newSticky.style.backgroundColor = randomColor();
    stickyArea.append(newSticky);
    positionSticky(newSticky);
    applyDeleteListener();
    clearStickyForm();
  }
  function loadSticky(note_id, title, text) {
    const newSticky = document.createElement('div');
    newSticky.setAttribute('id', note_id)
    const html = `<h3>${title.replace(
      /<\/?[^>]+(>|$)/g,
      ''
    )}</h3><p>${text
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(
      /\r\n|\r|\n/g,
      '<br />'
    )}</p><span class="deletesticky">&times;</span>`;
    newSticky.classList.add('drag', 'sticky');
    newSticky.innerHTML = html;
    // newSticky.style.backgroundColor = randomColor();
    stickyArea.append(newSticky);
    positionSticky(newSticky);
    applyDeleteListener();
    clearStickyForm();
  }
  function clearStickyForm() {
    stickyTitleInput.value = '';
    stickyTextInput.value = '';
  }
  function positionSticky(sticky) {
    sticky.style.left =
      window.innerWidth / 2 -
      sticky.clientWidth / 2 +
      (-100 + Math.round(Math.random() * 50)) +
      'px';
    sticky.style.top =
      window.innerHeight / 2 -
      sticky.clientHeight / 2 +
      (-100 + Math.round(Math.random() * 50)) +
      'px';
  }

  function editSticky() {}

  function stripHtml(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, '');
  }

  function randomColor() {
    const r = 200 + Math.floor(Math.random() * 56);
    const g = 200 + Math.floor(Math.random() * 56);
    const b = 200 + Math.floor(Math.random() * 56);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function applyDeleteListener() {
    let deleteStickyButtons = document.querySelectorAll(
      '.deletesticky'
    );
    deleteStickyButtons.forEach(dsb => {
      dsb.removeEventListener('click', deleteSticky, false);
      dsb.addEventListener('click', deleteSticky);
    });
  }

  window.addEventListener('mousedown', e => {
    if (!e.target.classList.contains('drag')) {
      return;
    }
    dragTarget = e.target;
    dragTarget.parentNode.append(dragTarget);
    lastOffsetX = e.offsetX;
    lastOffsetY = e.offsetY;
    // console.log(lastOffsetX, lastOffsetY);
    isDragging = true;
  });
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', () => (isDragging = false));

  createStickyButton.addEventListener('click', sendCreateNote);
  applyDeleteListener();

  // load notes
  getBoard(board_id).then(board => {
    if (board) {
      notes = notes.concat(board.notes)
      notes.forEach(note => {
        loadSticky(note._id, note.title, note.text)
      })
    } else {
      // window.location.href = "/undefined"
    }
  }).catch(e => {
    console.log('e', e)
    // window.location.href = "/undefined"
  })
});

