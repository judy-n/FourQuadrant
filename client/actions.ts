import axios from "axios";
import type { BoardDoc, Note, NoteDoc } from "./types";

// different port for dev server ???
//@ts-ignore
const { VITE_API_URL, VITE_API_DEV_URL, MODE } = import.meta.env;
let baseURL = MODE === "development" ? VITE_API_DEV_URL : VITE_API_URL;

//@ts-ignore
console.log("with", baseURL, JSON.stringify(import.meta.env));

// where the frontend communicates with the backend
const instance = axios.create({
  baseURL,
  timeout: 1000,
  headers: { "X-Custom-Header": "foobar" },
});

export const createBoard = (): Promise<BoardDoc> => {
  return instance
    .post("/board", {}, { timeout: 20000 })
    .then((res) => {
      return res.data.board;
    })
    .catch((err) => {
      console.error("oops", err);
    });
};

export const createNote = (board_id: string, note: Note): Promise<NoteDoc> => {
  console.log("sending", board_id, note);
  return instance
    .post(`/note/${board_id}`, { note })
    .then((res) => res.data.newNote)
    .catch(console.error);
};

export const getBoard = (board_id: string): Promise<BoardDoc> => {
  return instance
    .get(`/board/${board_id}`)
    .then((res) => res.data.board)
    .catch(console.error);
};

export const renameBoard = (board_id, name): Promise<string> => {
  return instance
    .post(`/board/rename/${board_id}`, { name })
    .then((res) => res.data.message)
    .catch(console.error);
};

export const getNote = (note_id): Promise<NoteDoc> => {
  return instance
    .get(`/note/${note_id}`)
    .then((res) => res.data.note)
    .catch(console.error);
};

export const deleteBoard = (board_id): Promise<BoardDoc> => {
  return instance
    .delete(`/board/rename/${board_id}`)
    .then((res) => res.data.board)
    .catch(console.error);
};

export const deleteNote = (note_id): Promise<NoteDoc> => {
  return instance
    .delete(`/note/${note_id}`)
    .then((res) => res.data.note)
    .catch(console.error);
};

export const updateNote = (note): Promise<NoteDoc> => {
  return instance
    .patch("/note", { note })
    .then((res) => res.data.note)
    .catch(console.error);
};

export const updateNotePos = (
  note_id,
  pos
): Promise<{ left: number; top: number }> => {
  return instance
    .patch(`/note/${note_id}/position`, { pos })
    .then((res) => res.data.pos)
    .catch(console.error);
};

export const updateNoteSize = (
  note_id,
  size
): Promise<{ width: number; height: number }> => {
  return instance
    .patch(`/note/${note_id}/size`, { size })
    .then((res) => res.data.size)
    .catch((err) => console.error);
};

export const logMessage = (board_id, message): Promise<string> => {
  return instance
    .patch(`/board/${board_id}/log`, { message })
    .then((res) => res.data.message)
    .catch(console.error);
};

export const clearLog = (board_id): Promise<string> => {
  return instance
    .delete(`/board/${board_id}/log`)
    .then((res) => res.data.message)
    .catch(console.error);
};

export const getUsername = (): Promise<string> => {
  return instance
    .get("/username")
    .then((res) => res.data.username)
    .catch(console.error);
};

export const setUsername = (username): Promise<string> => {
  return instance
    .post("/username", { username })
    .then((res) => res.data.message)
    .catch(console.error);
};

export const getAdminStats = (secret): Promise<any> => {
  // TODO
  return instance
    .post("/adminStats", { secret })
    .then((res) => res.data.stats)
    .catch(console.error);
};

export const isProtected = (board_id) => {
  return instance
    .get(`/isProtected/${board_id}`)
    .then((res) => !!res.data.isProtected)
    .catch(console.error);
};

export const protect = (board_id, password): Promise<boolean> => {
  return instance
    .post(`/protect/${board_id}`, { password })
    .then((res) => res.data.success)
    .catch(console.error);
};

export const checkPassword = (board_id, password): Promise<boolean> => {
  return instance
    .post(`/checkPassword/${board_id}`, { password })
    .then((res) => res.data.success)
    .catch(console.error);
};

export const updatePassword = async (
  board_id,
  oldPassword,
  newPassword
): Promise<boolean> => {
  const success = await checkPassword(board_id, oldPassword);
  if (success) {
    return await protect(board_id, newPassword);
  }
  return Promise.reject("failed to protect board");
};
