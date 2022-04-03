import type { ObjectId } from "mongodb";

export interface Pos {
    left: number,
    top: number
}

export interface Size {
    width: number,
    height: number
}

export interface Visit {
    visitedAt: Date;
    username: string;
}

export interface Note {
    title: string;
    text: string;
    pos: Pos;
    size?: Size;
    createdAt?: Date;
}

export interface NoteDoc extends Note {
    _id: ObjectId;
}

export interface Board {
    notes: Note[];
    log: string[];
    createdAt: Date;
    password: string;
    isProtected: boolean;
    name: string;
}

export interface BoardDoc extends Board {
    _id: ObjectId;
    notes: NoteDoc[];
}

export interface AdminStats {
    averageBoards: number;
    secret: string;
    totalBoards: number;
    totalNotes: number;
    totalVisits: number;
    averageNotes: number;
    averageVisits: number;
    todaysBoards: number;
    todaysNotes: number;
    todaysVisits: number;
}