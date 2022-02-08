"use strict";

const socket = io()
const board_id = window.location.href.split('/')[3]
const defaultPos = {left: 0, top: 0}
let username = null;

document.addEventListener("DOMContentLoaded", () => {
  const stickyArea = document.querySelector("#stickies-container");
  const createStickyButton = document.querySelector("#createsticky");

  const stickyTitleInput = document.querySelector("#stickytitle");
  const stickyTextInput = document.querySelector("#stickytext");

  getUsername().then(res => {
    username = res
    document.querySelector('.name-input').value = res
  })

  // helpers
  const getBoardBounds = () => {
    const topMin = document.querySelector(".h-titles").clientHeight;
    const leftMin = document.querySelector(".v-titles").clientWidth;
    const topMax = document.querySelector(".q-container").clientHeight + topMin;
    const leftMax =
      document.querySelector(".q-container").clientWidth + leftMin;
    return { topMin, leftMin, topMax, leftMax };
  };

  const normalize = ({ x, y }) => {
    const { topMin, leftMin, topMax, leftMax } = getBoardBounds();
    const left = x * (leftMax - leftMin) + leftMin;
    const top = y * (topMax - topMin) + topMin;
    return { left, top };
  };

  // socket.io functions
  const sendCreateNote = () => {
    // create a note and send it
    // here we have access to title and text field
    const title = stickyTitleInput.value;
    const text = stickyTextInput.value;
    const pos = { left: Math.random(), top: Math.random() };
    const note = { title, text, pos };
    createNote(board_id, note)
      .then((newNote) => {
        socket.emit("note created", { note: newNote, board_id, username });
        createSticky(newNote._id, pos);
      })
      .catch((e) => console.log("an unknown error occurred"));
  };
  const sendUpdateNote = (_id, title, text, pos) => {
    const note = { _id, title, text, tempQuadrant: defaultPos };
    updateNote(note)
      .then((resNote) => {
        socket.emit("note update", { note: resNote, board_id, username });
      })
      .catch((e) => console.log("an error occurred"));
  };
  const sendMoveNote = (note_id, pos) => {
    updateNotePos(note_id, pos)
      .then((_resPos) => {
        socket.emit("note move", { note_id, pos, board_id });
      })
      .catch((e) => console.error("an unknown error has occurred"));
  };
  const socketMoveNote = (note_id, pos) => {
    // send update to other users but not database
    socket.emit("note move", { note_id, pos, board_id });
  };
  const sendResizeNote = (note_id, size) => {
    updateNoteSize(note_id, size)
      .then((_resSize) => {
        socket.emit("note resize", { note_id, size, board_id });
      })
      .catch((e) => console.error("an unknown error occurred"));
  };
  const socketResizeNote = (note_id, size) => {
    // send update to other users but not database
    socket.emit("note resize", { note_id, size, board_id });
  };
  const sendDeleteNote = (note_id, title) => {
    deleteNote(note_id).then(note => {
      socket.emit('note delete', {note_id, board_id, username, title: note.title})
    })
  }

  interact(".sticky").resizable({
    edges: { top: false, left: false, bottom: true, right: true },
    listeners: {
      move: function (event) {
        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
        });

        const id = event.target.getAttribute("id");
        const size = { width: event.rect.width, height: event.rect.height };
        socketResizeNote(id, size);
      },
      end: function (event) {
        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
        });

        const id = event.target.getAttribute("id");
        const size = { width: event.rect.width, height: event.rect.height };
        sendResizeNote(id, size);
      },
    },
  });

  interact(".sticky").draggable({
    onmove(event) {
      const left = parseFloat(event.target.style.left) + event.dx;
      const top = parseFloat(event.target.style.top) + event.dy;
      event.target.style.left = `${left}px`;
      event.target.style.top = `${top}px`;

      const id = event.target.getAttribute("id");
      const { topMin, leftMin, topMax, leftMax } = getBoardBounds();
      // x is left 0to1, y is top 0to1
      const x = (left - leftMin) / (leftMax - leftMin);
      const y = (top - topMin) / (topMax - topMin);
      socketMoveNote(id, { left: x, top: y });
    },
    onend(event) {
      const left = parseFloat(event.target.style.left) + event.dx;
      const top = parseFloat(event.target.style.top) + event.dy;

      const id = event.target.getAttribute("id");
      const { topMin, leftMin, topMax, leftMax } = getBoardBounds();
      // x is left 0to1, y is top 0to1
      const x = (left - leftMin) / (leftMax - leftMin);
      const y = (top - topMin) / (topMax - topMin);
      sendMoveNote(id, { left: x, top: y });
    },
  });

  const receiveCreatedNote = ({ note, io_board_id }) => {
    if (io_board_id === board_id) {
      loadSticky(note._id, note.title, note.text, note.pos);
    }
  };
  const receiveUpdatedNote = ({ note, io_board_id }) => {
    if (io_board_id === board_id) {
      const noteEL = document.querySelector(`.sticky[id="${note._id}"]`);
      noteEL.querySelector("h3").innerText = note.title;
      noteEL.querySelector("p").innerText = note.text;
    }
  };
  const receiveMoveNote = ({ note_id, pos, io_board_id }) => {
    if (io_board_id === board_id) {
      const noteEl = document.querySelector(`.sticky[id="${note_id}"]`);
      const { left, top } = normalize({ x: pos.left, y: pos.top });
      noteEl.style.left = `${left}px`;
      noteEl.style.top = `${top}px`;
    }
  };
  const receiveResizeNote = ({ note_id, size, io_board_id }) => {
    if (io_board_id === board_id) {
      const noteEl = document.querySelector(`.sticky[id="${note_id}"]`);
      noteEl.style.width = `${size.width}px`;
      noteEl.style.height = `${size.height}px`;
    }
  };
  const receiveDeleteNote = ({ note_id, io_board_id }) => {
    if (io_board_id === board_id) {
      const el = document.querySelector(`.sticky[id="${note_id}"]`);
      el.parentElement.removeChild(el);
    }
  };

  socket.on("receive note", ({ note, io_board_id }) => {
    receiveCreatedNote({ note, io_board_id });
  });

  socket.on("receive update", ({ note, io_board_id }) => {
    receiveUpdatedNote({ note, io_board_id });
  });

  socket.on("receive move", ({ note_id, pos, io_board_id }) => {
    receiveMoveNote({ note_id, pos, io_board_id });
  });

  socket.on("receive resize", ({ note_id, size, io_board_id }) => {
    receiveResizeNote({ note_id, size, io_board_id });
  });

  socket.on("receive delete", ({ note_id, io_board_id }) => {
    receiveDeleteNote({ note_id, io_board_id });
  });

  socket.on('receive create log', ({io_board_id, username, title}) => {
    if (io_board_id === board_id) {
      newStickyLog(username, title)
    }
  })

  socket.on('receive update log', ({io_board_id, username, title}) => {
    if (io_board_id === board_id) {
      updateStickyLog(username, title)
    }
  })

  socket.on('receive delete log', ({io_board_id, username, title}) => {
    if (io_board_id === board_id) {
      deleteStickyLog(username, title)
    }
  })

  const deleteSticky = e => {
    const id = e.target.parentElement.getAttribute('id')
    const title = getNote(id).title || '[no title]'
    e.target.parentNode.remove();
    sendDeleteNote(id, title);
  };

  const editSticky = (e) => {
    const sticky = e.target.parentElement;
    const edith3 = document.createElement("input");
    edith3.classList = sticky.querySelector("h3").classList;
    edith3.classList.add("input-h3");
    edith3.value = sticky.querySelector("h3").innerText;
    const editp = document.createElement("textarea");
    editp.classList = sticky.querySelector("p").classList;
    editp.classList.add("input-p");
    editp.value = sticky.querySelector("p").innerText;
    sticky.querySelector("h3").remove();
    sticky.querySelector("p").remove();
    sticky.appendChild(edith3);
    sticky.appendChild(editp);
    sticky
      .querySelector(".editsticky")
      .removeEventListener("click", editSticky, false);
    sticky.querySelector(".editsticky").addEventListener("click", blurInputs);
    // sticky.querySelector('.editsticky').innerText = 'Update'
    sticky.querySelector(".editsticky").src = "/icons/check.png";
  };

  const blurInputs = async (e) => {
    const sticky = e.target.parentElement;
    // send updates
    const id = sticky.getAttribute("id");
    const title = sticky.querySelector(".input-h3").value;
    const text = sticky.querySelector(".input-p").value;
    try {
      await sendUpdateNote(id, title, text);
    } catch (e) {
      console.log("an error occured");
      return;
    } finally {
      // reset note
      const h3 = document.createElement("h3");
      h3.classList = sticky.querySelector(".input-h3").classList;
      h3.classList.remove("input-h3");
      h3.innerText = title;
      const p = document.createElement("p");
      p.classList = sticky.querySelector(".input-p").classList;
      p.classList.remove("input-p");
      p.innerText = text;
      sticky.querySelector(".input-h3").remove();
      sticky.querySelector(".input-p").remove();
      sticky.appendChild(h3);
      sticky.appendChild(p);
      sticky
        .querySelector(".editsticky")
        .removeEventListener("click", blurInputs, false);
      sticky.querySelector(".editsticky").addEventListener("click", editSticky);
      // sticky.querySelector('.editsticky').innerText = 'Edit'
      sticky.querySelector(".editsticky").src = "/icons/edit.png";
    }
  };

  function createSticky(note_id, pos) {
    const newSticky = document.createElement("div");
    newSticky.setAttribute("id", note_id);
    const html = `<h3>${stickyTitleInput.value.replace(
      /<\/?[^>]+(>|$)/g,
      ""
    )}</h3><p>${stickyTextInput.value
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(
        /\r\n|\r|\n/g,
        "<br />"
      )}</p><input type="image" src="/icons/edit.png" class="editsticky"></input><span class="deletesticky">&times;</span>`;
    newSticky.classList.add("drag", "sticky");
    newSticky.innerHTML = html;
    // newSticky.style.backgroundColor = randomColor();
    stickyArea.append(newSticky);
    positionSticky(newSticky, pos);
    applyDeleteListener();
    clearStickyForm();
  }
  function loadSticky(note_id, title, text, pos, size = null) {
    const newSticky = document.createElement("div");
    newSticky.setAttribute("id", note_id);
    const html = `<h3>${title.replace(/<\/?[^>]+(>|$)/g, "")}</h3><p>${text
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(
        /\r\n|\r|\n/g,
        "<br />"
      )}</p><input type="image" src="/icons/edit.png" class="editsticky"></input><span class="deletesticky">&times;</span>`;
    newSticky.classList.add("drag", "sticky");
    newSticky.innerHTML = html;
    if (size) {
      newSticky.style.width = `${size.width}px`;
      newSticky.style.height = `${size.height}px`;
    }
    // newSticky.style.backgroundColor = randomColor();
    stickyArea.append(newSticky);
    positionSticky(newSticky, pos);
    applyDeleteListener();
    clearStickyForm();
  }
  function clearStickyForm() {
    stickyTitleInput.value = "";
    stickyTextInput.value = "";
  }
  function positionSticky(sticky, pos) {
    const { left, top } = normalize({ x: pos.left, y: pos.top });
    sticky.style.left = `${left}px`;
    sticky.style.top = `${top}px`;
  }

  function stripHtml(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, "");
  }

  function randomColor() {
    const r = 200 + Math.floor(Math.random() * 56);
    const g = 200 + Math.floor(Math.random() * 56);
    const b = 200 + Math.floor(Math.random() * 56);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function applyDeleteListener() {
    let deleteStickyButtons = document.querySelectorAll(".deletesticky");
    deleteStickyButtons.forEach((dsb) => {
      dsb.removeEventListener("click", deleteSticky, false);
      dsb.addEventListener("click", deleteSticky);
    });
    let editStickyButtons = document.querySelectorAll(".editsticky");
    editStickyButtons.forEach((esb) => {
      esb.removeEventListener("click", editSticky, false);
      esb.addEventListener("click", editSticky);
    });
  }

  createStickyButton.addEventListener("click", sendCreateNote);
  applyDeleteListener();

  function loadLogs(logs) {
    logs.forEach(log => {
      if(log.includes('made a new')) {
        const [username, title] = log.split(' made a new sticky with title ')
        newStickyLog(username, title)
      } else if (log.includes('updated')) {
        const [username, title] = log.split(' updated sticky titled ')
        updateStickyLog(username, title)
      } else if (log.includes('removed')) {
        const [username, title] = log.split(' removed the sticky with title ')
        deleteStickyLog(username, title)
      }
    })
  }

  async function loadBoard() {
    const boardProtected = await isProtected(board_id)
    const check = new Promise((resolve, reject) => {
      if (boardProtected) {
        Swal.fire({
          title: "Sign In",
          text: "This board is password protected",
          html: `
            <input type="password" id="pass-input" class="swal2-input" placeholder="Password"/>
          `,
          confirmButtonColor: '#577399',
          confirmButtonText: `<span style="font-family: Space Mono">Sign In</span>`,
          preConfirm: () => {
            const password = Swal.getPopup().querySelector('#pass-input').value
            if (!password) {
              Swal.showValidationMessage("Please enter a password")
            }
            return password
          }
        }).then(result => {
          if (result.isConfirmed) {

            checkPassword(board_id, result.value).then(success => {
              if (success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  confirmButtonColor: '#577399',
                  confirmButtonText: `<span style="font-family: Space Mono">OK</span>`,
                })
                resolve(true)
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error Signing In',
                }).then(() => resolve(false))
              }
            })
          }
        })
      } else {
        resolve(true)
      }
    })
    check.then(success => {
      if (!success) {
        window.location.href = '/'
      }
      getBoard(board_id)
        .then((board) => {
          if (board) {
            board.notes.forEach((note) => {
              loadSticky(note._id, note.title, note.text, note.pos, note.size);
            });
            loadLogs(board.log)
            document.title = board.name
            document.querySelector('.board-title').setAttribute('value', board.name)
          } else {
            // window.location.href = "/undefined"
          }
        })
        .catch((e) => {
          console.log("e", e);
          // window.location.href = "/undefined"
        });
    })
  }
  loadBoard()


    function newStickyLog(username, title){
      const newLog = document.createElement('p')
      newLog.classList.add("log-entry")
      newLog.innerHTML = `<span class="log-keyword">` + username + `</span> made a new sticky with title `
      + `<span class="log-keyword">` + title + `</span>`
      const logArea = document.querySelector(".log-console")
      logArea.appendChild(newLog)
      logArea.scrollTop = logArea.scrollHeight
      logMessage(board_id, `${username} made a new sticky with title ${title}`)
    }

    function updateStickyLog(username, title){
      const newLog = document.createElement('p')
      newLog.classList.add("log-entry")
      newLog.innerHTML = `<span class="log-keyword">` + username + `</span> updated sticky titled `
      + `<span class="log-keyword">` + title + `</span>`
      const logArea = document.querySelector(".log-console")
      logArea.appendChild(newLog)
      logArea.scrollTop = logArea.scrollHeight
      logMessage(board_id, `${username} updated sticky titled ${title}`)
    }

    function deleteStickyLog(username, title){
      const newLog = document.createElement('p')
      newLog.classList.add("log-entry")
      newLog.innerHTML = `<span class="log-keyword">` + username + `</span> removed the sticky with title `
      + `<span class="log-keyword">` + title + `</span>`
      const logArea = document.querySelector(".log-console")
      logArea.appendChild(newLog)
      logArea.scrollTop = logArea.scrollHeight
      logMessage(board_id, `${username} removed the sticky with title ${title}`)
    }

  function openPopup() {
    const link = window.location.href;
    Swal.fire({
      title: "Share this board!",
      text: "Click the button to copy the link & share it with others!",
      html: '<input type="text" value="' + link + '" readonly size="60">',
      showCancelButton: true,
      confirmButtonColor: '#577399',
      confirmButtonText: `<span style="font-family: Space Mono">Copy Link</span>`,
      cancelButtonText: `<span style="font-family: Space Mono">Cancel</span>`,
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(link);
        Swal.fire({
          title: "Copied!",
          icon: "success",
          confirmButtonColor: '#577399',
          confirmButtonText: `<span style="font-family: Space Mono">OK</span>`
        });
      }
    });
  }

  async function protectPopup() {
    const boardProtected = await isProtected(board_id)
    if (!boardProtected) {
      Swal.fire({
        title: "Protect Board",
        html: `
          <input type="password" id="pass-input" class="swal2-input" placeholder="Password" style="font-family: Space Mono"/>
        `,
        confirmButtonColor: '#577399',
        confirmButtonText: `<span style="font-family: Space Mono">Protect</span>`,
        preConfirm: () => {
          const password = Swal.getPopup().querySelector('#pass-input').value
          if (!password) {
            Swal.showValidationMessage("Please enter a password")
          }
          return password
        }
      }).then(result => {
        if (result.isConfirmed) {
          protect(board_id, result.value).then(success => {
            if (success) {
              Swal.fire({
                icon: 'success',
                title: 'Board Protected',
                confirmButtonColor: '#577399',
                confirmButtonText: `<span style="font-family: Space Mono">OK</span>`
              })
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error Protecting Board',
              })
            }
          })
        }
      })
    } else {
      Swal.fire({
        title: "Update Password",
        text: "This board is password protected",
        html: `
          <input type="password" id="pass-input" class="swal2-input" placeholder="Password" style="font-family: Space Mono"/>
          <input type="password" id="new-pass-input" class="swal2-input" placeholder="New Password" style="font-family: Space Mono"/>
        `,
        confirmButtonColor: '#577399',
        confirmButtonText: `<span style="font-family: Space Mono">Update</span>`,
        preConfirm: () => {
          const oldPassword = Swal.getPopup().querySelector('#pass-input').value
          const newPassword = Swal.getPopup().querySelector('#new-pass-input').value
          if (!oldPassword || !newPassword) {
            Swal.showValidationMessage("Please enter a value for password")
          } else {
            return { oldPassword, newPassword }
          }
        },
        showDenyButton: true,
        denyButtonText: `<span style="font-family: Space Mono">Remove Password</span>`,
        preDeny: () => {
          const oldPassword = Swal.getPopup().querySelector('#pass-input').value
          if (!oldPassword) {
            Swal.showValidationMessage("Please enter your current password in the first box")
            return false
          } else {
            return { oldPassword }
          }
        },
        reverseButtons: true,
      }).then(result => {
        if (result.isConfirmed || result.isDenied) {
          let { oldPassword, newPassword } = result.value
          if (result.isDenied) {
            newPassword = ""
          }
          updatePassword(board_id, oldPassword, newPassword).then(success => {
            if (success) {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Password Updated',
                confirmButtonColor: '#577399',
                confirmButtonText: `<span style="font-family: Space Mono">OK</span>`
              })
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error Updating Password',
              })
            }
          })
        }
      })
    }
  }

  document.querySelector(".share-btn").addEventListener("click", openPopup);
  document.querySelector(".lock-btn").addEventListener("click", protectPopup)
  document.querySelector(".name-input").addEventListener("blur", (e) => {
    username = e.target.value
    setUsername(username)
  })
  document.querySelector(".board-title").addEventListener("blur", (e) => {
    document.title = e.target.value
    renameBoard(board_id, e.target.value)
  })
  document.querySelector(".info-btn").addEventListener("click", () => swal.fire({
    icon: "info",
    title: "About",
    iconColor: "#577399",
    showCloseButton: true,
    showConfirmButton: false,
    // closeButtonColor: "#577399",
    // closeButtonHtml: "<h1>Continue</h1>",
    html: "FourQuadrant is an open-source program maintained and run by <a href=\"https://judyn.me\">Judy</a> and <a href=\"https://www.julienbl.me\">Julien</a>, two students at the University of Toronto.<br>Check out the source code on github and join our slack to chat with us!<br><br><a href=\"https://github.com/judy-n/FourQuadrant\" class=\"gh-btn\"><img class=\"brand-img\" src=\"icons/GitHub-Mark-120px-plus.png\"></a><a href=\"https://join.slack.com/t/fourquadrantworkspace/shared_invite/zt-138mkw6v6-1eraHaxQ~PTBQsGp59mJmQ\" class=\"gh-btn\"><img class=\"brand-img\" src=\"icons/Slack_Mark_Web.png\"></a>"
  }))
});
