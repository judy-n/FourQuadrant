import { ObjectId } from "mongodb"
import type { AdminStats, BoardDoc, Note, NoteDoc, Pos, Size } from "../types"

export const createBoard = async (): Promise<BoardDoc> => {
    return {
        _id: new ObjectId("mockedid"),
        createdAt: new Date(),
        isProtected: false,
        log: [],
        name: "My board",
        notes: [],
        password: ""
    }
}

export const createNote = async (_board_id: string, note: Note): Promise<NoteDoc> => {
    return {
        ...note,
        _id: new ObjectId(`mockedid${Math.ceil(Math.random()*100)}`)
    }
}

export const getBoard = async (_board_id: string): Promise<BoardDoc> => {
    return {
        _id: new ObjectId("mockedid"),
        createdAt: new Date(),
        isProtected: false,
        log: [],
        name: "My board",
        notes: [],
        password: ""
    }
}

export const renameBoard = (_board_id: string, _name: string) => Promise.resolve("success!")

export const getNote = async (_node_id: string): Promise<NoteDoc> => {
    const randNum = Math.random()*100
    return {
        _id: new ObjectId(`mockedid${randNum}`),
        createdAt: new Date(),
        pos: {left: 0.5, top: 0.5},
        size: null,
        text: `_id: ${randNum}`,
        title: "Mocked Note",
    }
}

export const deleteBoard = async (_board_id: string): Promise<BoardDoc> => {
    return {
        _id: new ObjectId("mockedid"),
        createdAt: new Date(),
        isProtected: false,
        log: [],
        name: "My board",
        notes: [],
        password: ""
    }
}

export const deleteNote = async (note_id: string): Promise<NoteDoc> => {
    return {
        _id: new ObjectId(note_id),
        createdAt: new Date(),
        pos: {left: 0.5, top: 0.5},
        size: null,
        text: "[deleted]",
        title: "[deleted]",
    }
}

export const updateNote = async (note: Note): Promise<NoteDoc> => {
    return {
        ...note,
        _id: new ObjectId("mockedid"),
    }
}

export const updateNotePos = async (_note_id: string, pos: Pos): Promise<Pos> => Promise.resolve(pos)

export const updateNoteSize = (_note_id: string, size: Size): Promise<Size> => Promise.resolve(size)

export const logMessage = (_board_id: string, message: string) => Promise.resolve(message)

export const clearLog = (_board_id: string) => Promise.resolve("success!")

export const getUsername = () => Promise.resolve("mocked-username")

export const setUsername = (username: string) => Promise.resolve(username)

export const getAdminStats = async (_secret: string): Promise<AdminStats> => {
    return  {
        averageBoards: 10,
        averageNotes: 11,
        averageVisits: 12,
        secret: "mockedsecret",
        todaysBoards: 1,
        todaysNotes: 2,
        todaysVisits: 1,
        totalBoards: 681,
        totalNotes: 531,
        totalVisits: 1345
    }
}

export const isProtected = (_board_id: string) => Promise.resolve(false)

export const protect = (_board_id: string, _password: string) => Promise.resolve(true)

export const checkPassword = (_board_id: string, _password: string) => Promise.resolve(true)

export const updatePassword = (_board_id: string, _oldPassword: string, _newPassword: string) => Promise.resolve(true)