// where the frontend communicates with the backend
const instance = axios.create({
    baseURL: '/api',
    timeout: 1000,
    headers: {'X-Custom-Header': 'foobar'}
});

const createBoard = () => {
    return instance.post('/board')
        .then(res => res.data.board)
        .catch(err => console.error)
}

const createNote = (board_id, note) => {
    return instance.post(`/note/${board_id}`, {note})
        .then(res => res.data.newNote)
        .catch(err => console.error)
}

const getBoard = (board_id) => {
    return instance.get(`/board/${board_id}`)
        .then(res => res.data.board)
        .catch(err => console.error)
}

const getNote = (note_id) => {
    return instance.get(`/note/${note_id}`)
        .then(res => res.data.note)
        .catch(err => console.error)
}

const deleteBoard = (board_id) => {
    return instance.delete(`/board/${board_id}`)
        .then(res => res.data.board)
        .catch(err => console.error)
}

const deleteNote = (note_id) => {
    return instance.delete(`/note/${note_id}`)
        .then(res => res.data.note)
        .catch(err => console.error)
}

const updateNote = (note) => {
    return instance.patch('/note', {note})
        .then(res => res.data.note)
        .catch(err => console.error)
}