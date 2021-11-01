'use strict';

const socket = io()
const board_id = window.location.href.split('/')[3]
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
    console.log('n', board_id, note)
    createNote(board_id, note).then(newNote => {
      socket.emit('note created', {note: newNote, board_id})
      createSticky(newNote._id)
    }).catch(e => console.log('an unknown error occurred'))
  }
  // const sendUpdateNote = (note_id, noteEl) => {
  //   const title = noteEl.querySelector('h3').innerText
  //   let text = noteEl.querySelector('p').innerText //may need to change this idk
  //   const note = { title, text, tempQuadrant }
  //   updateNote(note).then(resNote => {
  //     socket.emit('note update', {note: resNote, board_id})
  //   })
  // } for later
  const sendDeleteNote = (note_id) => {
    deleteNote(note_id).then(note => {
      socket.emit('note delete', {note_id, board_id})
    })
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
      const el = document.querySelector(`.sticky[id="${note_id}"]`)
      el.parentElement.removeChild(el)
    }
  }

  socket.on('receive note', ({note, io_board_id}) => {
    receiveCreatedNote({note, io_board_id})
  })

  socket.on('receive delete', ({note_id, io_board_id}) => {
    receiveDeleteNote({note_id, io_board_id})
  })

  const deleteSticky = e => {
    const id = e.target.parentElement.getAttribute('id')
    e.target.parentNode.remove();
    sendDeleteNote(id)
  };

  const editSticky = e => {
    const sticky = e.target.parentElement
    const edith3 = document.createElement('input')
    edith3.classList = sticky.querySelector('h3').classList
    edith3.classList.add('input-h3')
    edith3.value = sticky.querySelector('h3').innerText
    const editp = document.createElement('textarea')
    editp.classList = sticky.querySelector('p').classList
    editp.classList.add('input-p')
    editp.value = sticky.querySelector('p').innerText
    sticky.querySelector('h3').remove()
    sticky.querySelector('p').remove()
    sticky.appendChild(edith3)
    sticky.appendChild(editp)
    sticky.querySelector('.editsticky').removeEventListener('click', editSticky, false)
    sticky.querySelector('.editsticky').addEventListener('click', blurInputs)
    sticky.querySelector('.editsticky').innerText = 'Update'
  }

  const blurInputs = e => {
    const sticky = e.target.parentElement
    const h3 = document.createElement('h3')
    h3.classList = sticky.querySelector('.input-h3').classList
    h3.classList.remove('input-h3')
    h3.innerText = sticky.querySelector('.input-h3').value
    const p = document.createElement('p')
    p.classList = sticky.querySelector('.input-p').classList
    p.classList.remove('input-p')
    p.innerText = sticky.querySelector('.input-p').value
    sticky.querySelector('.input-h3').remove()
    sticky.querySelector('.input-p').remove()
    sticky.appendChild(h3)
    sticky.appendChild(p)
    sticky.querySelector('.editsticky').removeEventListener('click', blurInputs, false)
    sticky.querySelector('.editsticky').addEventListener('click', editSticky)
    sticky.querySelector('.editsticky').innerText = 'Edit'
  }

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
    newSticky.addEventListener('dblclick', e => console.log(e))
    const html = `<h3>${stickyTitleInput.value.replace(
      /<\/?[^>]+(>|$)/g,
      ''
    )}</h3><p>${stickyTextInput.value
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(
      /\r\n|\r|\n/g,
      '<br />'
    )}</p><button class="editsticky">Edit</button><span class="deletesticky">&times;</span>`;
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
    )}</p><button class="editsticky">Edit</button><span class="deletesticky">&times;</span>`;
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
    let editStickyButtons = document.querySelectorAll('.editsticky')
    editStickyButtons.forEach(esb => {
      esb.removeEventListener('click', editSticky, false)
      esb.addEventListener('click', editSticky)
    })
  }
  window.addEventListener('mousedown', e => {
    if (e.target.classList.contains('drag')) {
      dragTarget = e.target;
      dragTarget.parentNode.append(dragTarget);
      lastOffsetX = e.offsetX;
      lastOffsetY = e.offsetY;
      // console.log(lastOffsetX, lastOffsetY);
      isDragging = true;
    }
  });
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', () => (isDragging = false));

  createStickyButton.addEventListener('click', sendCreateNote);
  applyDeleteListener();

  // load notes
  getBoard(board_id).then(board => {
    if (board) {
      board.notes.forEach(note => {
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

