// where the frontend communicates with the backend
const instance = axios.create({
  baseURL: "/api",
  timeout: 1000,
  headers: { "X-Custom-Header": "foobar" },
});

const createBoard = () => {
    return instance.post('/board')
        .then(res => res.data.board)
        .catch(console.error)
}

const createNote = (board_id, note) => {
    return instance.post(`/note/${board_id}`, {note})
        .then(res => res.data.newNote)
        .catch(console.error)
}

const getBoard = (board_id) => {
    return instance.get(`/board/${board_id}`)
        .then(res => res.data.board)
        .catch(console.error)
}

const getNote = (note_id) => {
    return instance.get(`/note/${note_id}`)
        .then(res => res.data.note)
        .catch(console.error)
}

const deleteBoard = (board_id) => {
    return instance.delete(`/board/${board_id}`)
        .then(res => res.data.board)
        .catch(console.error)
}

const deleteNote = (note_id) => {
    return instance.delete(`/note/${note_id}`)
        .then(res => res.data.note)
        .catch(console.error)
}

const updateNote = (note) => {
    return instance.patch('/note', {note})
        .then(res => res.data.note)
        .catch(console.error)
}

const updateNotePos = (note_id, pos) => {
    return instance.patch(`/note/${note_id}/position`, {pos})
        .then(res => res.data.pos)
        .catch(console.error)
}

const updateNoteSize = (note_id, size) => {
  return instance
    .patch(`/note/${note_id}/size`, { size })
    .then((res) => res.data.size)
    .catch((err) => console.error);
};

const logMessage = (board_id, message) => {
    return instance.patch(`/board/${board_id}/log`, {message})
        .then(res => res.data.message)
        .catch(console.error)
}

const clearLog = (board_id) => {
    return instance.delete(`/board/${board_id}/log`)
        .then(res => res.data.message)
        .catch(console.error)
}
