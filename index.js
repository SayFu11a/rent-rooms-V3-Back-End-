import express from 'express';
import mongoose from 'mongoose';

import fs from 'fs';
import { config } from 'dotenv';
config(); // не было

import cors from 'cors';

import multer from 'multer';

// import { restart } from 'nodemon';

import { registerValidation, loginValidation, postCreateValidation } from './validations/auth.js';

import { checkAuth, handleValidationErrors } from './utils/index.js';
import { UserController, PostController } from './controllers/index.js'; // все методы из UserController.js сохрани в перемен UserController

// import User from './models/User.js';

mongoose
   .connect(process.env.MONGODB_URI)
   .then(() => console.log('DB ok'))
   .catch((err) => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
   destination: (_, __, cb) => {
      if (!fs.existsSync('uploads')) {
         fs.mkdirSync('uploads');
      }
      cb(null, 'uploads');
   },
   filename: (_, file, cb) => {
      cb(null, file.originalname);
   },
});
app.use(cors());
const upload = multer({ storage }); // у мультера храниище сделалитз стородж

app.use(express.json()); // чтобы читать джейсон запросы.
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register); //  если придет пост запрос вернуть сексес тру, регистрация
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', upload.single('image'), (req, res) => {
   res.json({
      url: `/uploads/${req.file.originalname}`,
   });
});

// checkAuth был в уплоуде сверху

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
   '/posts/:id',
   checkAuth,
   postCreateValidation,
   handleValidationErrors,
   PostController.update,
);

app.listen(process.env.PORT || 4444, (err) => {
   if (err) {
      return console.log(err);
   }

   console.log('Server OK');
});

// app.get('/', (req, res) => {
//    res.send('Hello World');
// }); // если придет гет запрос вернуть хеловорлд

// app.post('/auth/login', (req, res) => {
//    console.log(req.body); // с помошью req получаем инфу

//    const token = jwt.sign(
//       {
//          email: req.body.email,
//          fullName: 'Хрен Моржовый',
//       },
//       'secret123',
//    ); // шифрует данные

//    res.json({
//       success: true,
//       token,
//    });
// }); //  если придет пост запрос вернуть сексес тру
