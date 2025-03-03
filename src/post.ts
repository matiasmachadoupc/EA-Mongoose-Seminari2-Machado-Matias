import { Schema, model, Document } from 'mongoose';
import { IUser } from './user.js';

// 1. Create an interface representing a TS object.
export interface IPost extends Document {
  title: string;
  content: string;
  author: IUser['name'];
  likes: number;
}

export interface IPostData {
  title: string;
  content: string;
  author: IUser['name'];
  likes: number;
}

// 2. Create a Schema corresponding to the document in MongoDB.
const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  author: { type: String, required: true }
});

// 3. Create a Model.
export const PostModel = model<IPost>('Post', postSchema);