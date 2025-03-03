import mongoose from 'mongoose';
import { UserModel, IUser } from './user.js';
import { PostModel, IPost, IPostData } from './post.js';

// Funciones CRUD para User
async function createUser(user: IUser): Promise<IUser> {
  const newUser = new UserModel(user);
  return await newUser.save();
}

async function getUser(userId: string): Promise<IUser | null> {
  return await UserModel.findById(userId);
}

async function updateUser(userId: string, user: Partial<IUser>): Promise<IUser | null> {
  return await UserModel.findByIdAndUpdate(userId, user, { new: true });
}

async function deleteUser(userId: string): Promise<IUser | null> {
  return await UserModel.findByIdAndDelete(userId);
}

async function listUsers(): Promise<IUser[]> {
  return await UserModel.find();
}

// Funciones CRUD para Post
async function createPost(post: IPostData): Promise<IPost> {
  const newPost = new PostModel(post);
  return await newPost.save();
}

async function getPost(postId: string): Promise<IPost | null> {
  return await PostModel.findById(postId).populate('author');
}

async function updatePost(postId: string, post: Partial<IPost>): Promise<IPost | null> {
  return await PostModel.findByIdAndUpdate(postId, post, { new: true }).populate('author');
}

async function deletePost(postId: string): Promise<IPost | null> {
  return await PostModel.findByIdAndDelete(postId).populate('author');
}

async function listPosts(): Promise<IPost[]> {
  return await PostModel.find().populate('author');
}

// Función Aggregation Pipeline
async function getUserByPostTitle(title: string) {
  return await PostModel.aggregate([
    { $match: { title: title } },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: 'name',
        as: 'authorDetails'
      }
    },
    { $unwind: '$authorDetails' },
    {
      $project: {
        _id: 0,
        authorDetails: 1
      }
    }
  ]);
}

async function main() {
  mongoose.set('strictQuery', true);

  await mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar:', err));

   // Crear usuario
   const user1 = await createUser({ name: 'Bill', email: 'bill@initech.com', avatar: 'https://i.imgur.com/dM7Thhn.png' });
   console.log("user1", user1);
 
   const user2 = await createUser({ name: 'Mike', email: 'mike@initech.com', avatar: 'https://i.imgur.com/dM7Thhn.png' });
   console.log("user2", user2);
 
 
   // Crear post
   const post1 = await createPost({ title: 'First Post', content: 'This is the first post', author: user1.name, likes: 5 });
   console.log("post1", post1);
 
   const post2 = await createPost({ title: 'Second Post', content: 'This is the second post', author: user1.name, likes: 2 });
   console.log("post2", post2);
 
   const post3 = await createPost({ title: 'Third Post', content: 'This is the third post', author: user2.name, likes: 10 });
   console.log("post3", post3);

  // Listar posts
  const posts = await listPosts();
  console.log("posts", posts);

  console.log();

  // Obtener un post
  const fetchedPost = await getPost(post1._id);
  console.log("fetchedPost", fetchedPost);

  // Actualizar un post
  const updatedPost = await updatePost(post1._id, { content: 'Updated content' });
  console.log("updatedPost", updatedPost);

  // Borrar un post
  const deletedPost = await deletePost(post1._id);
  console.log("deletedPost", deletedPost);

  // Obtener un post
  const fetchedDeletedPost = await getPost(post1._id);
  console.log();
  console.log("Does the post exist?", fetchedDeletedPost);
  if (!fetchedDeletedPost) {
    console.log("The post does not exist");
  }
  console.log();

  // Usar Aggregation Pipeline para obtener el usuario por el título del post
  const userByPostTitle = await getUserByPostTitle('Third Post');
  console.log("userByPostTitle", userByPostTitle);
}

main();