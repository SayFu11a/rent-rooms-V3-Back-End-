import PostModel from '../models/Post.js';

export const getLastTags = async (req, res) => {
   try {
      const posts = await PostModel.find().limit(5).exec();

      const tags = posts
         .map((obj) => obj.tags)
         .flat()
         .slice(0, 5);

      res.json(tags);
   } catch (err) {
      console.log(err);
      res.status(500).json({
         message: 'Не удалось получить статьи',
      });
   }
};

export const getAll = async (req, res) => {
   try {
      const posts = await PostModel.find()
         .populate({ path: 'user', select: ['fullName', 'avatarUrl'] })
         .exec();
      res.json(posts);
   } catch (err) {
      console.log(err);
      res.status(500).json({
         message: 'Не удалось получить статьи',
      });
   }
};

export const getOne = async (req, res) => {
   try {
      const postId = req.params.id;

      PostModel.findOneAndUpdate(
         {
            _id: postId,
         },
         {
            $inc: { viewsCount: 1 },
         },
         {
            returnDocument: 'after',
         },
      )
         .populate('user')
         .then((doc, err) => {
            if (err) {
               console.log(err);
               return res.status(500).json({
                  message: "Can't get article.",
               });
            }

            if (!doc) {
               return res.status(404).json({
                  message: 'Article not found.',
               });
            }

            res.json(doc);
         });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         message: 'Не удалось получить статьи',
      });
   }
};

export const remove = async (req, res) => {
   try {
      const postId = req.params.id;

      PostModel.findOneAndDelete(
         {
            _id: postId,
         },
         {
            returnDocument: 'after',
         },
      ).then((doc, err) => {
         if (err) {
            console.log(err);
            return res.status(500).json({
               message: 'Не получается удалить статью.',
            });
         }

         if (!doc) {
            return res.status(404).json({
               message: 'Article not found.',
            });
         }

         res.json({
            success: true,
         });
      });
   } catch (err) {
      console.log(err);
      return res.status(500).json({
         message: 'Не удалось получить статьи',
      });
   }
};

export const create = async (req, res) => {
   try {
      const doc = new PostModel({
         title: req.body.title,
         text: req.body.text,
         imageUrl: req.body.imageUrl,
         tags: req.body.tags.split(','),
         user: req.userId,
      });

      const post = await doc.save();

      res.json(post);
   } catch (err) {
      console.log(err);
      res.status(500).json({
         message: 'Не удалось создать статью',
      });
   }
};

export const update = async (req, res) => {
   try {
      const postId = req.params.id;

      await PostModel.updateOne(
         {
            _id: postId,
         },
         {
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
         },
      );

      res.json({
         success: true,
      });
   } catch (err) {
      console.log(err);
      return res.status(500).json({
         message: 'Не удалось обновить статьи',
      });
   }
};
