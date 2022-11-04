import { ObjectId, WithId } from "mongodb";

export interface INote extends WithId<Document> {
  title: string;
  text: string;
  pos: {
    x: string;
    y: string;
  };
  size: {
    width: string;
    height: string;
  };
  createdAt: Date;
}

export interface IBoard extends WithId<Document> {
  notes: ObjectId[];
  log: string[];
  createdAt: Date;
  password: string;
  isProtected: boolean;
  name: string;
}

export interface IBoardPopulated {
  _id: ObjectId;
  notes: INote[];
  log: string[];
  createdAt: Date;
  password: string;
  isProtected: boolean;
  name: string;
}

export interface IVisit {
  visitedAt: Date;
  username: string;
}
