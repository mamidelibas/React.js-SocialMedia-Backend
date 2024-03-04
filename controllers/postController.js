const { uploadImageToS3 } = require("../services/uploadService");
const Users = require("../models/User");
const ProfilePosts = require("../models/ProfilePosts");

const controller = {
  async publishPost(req, res) {
    const currentUserId = req?.user?._id;

    if (!currentUserId) {
      return res.status(400).send("Eksik parametre.");
    }

    try {
      const user = await Users.findById(currentUserId);

      if (!user) {
        return res.status(404).send("Kullanıcı bulunamadı.");
      }

      const { content, embedVideo } = req.body;

      const images = req.files?.image?.map((image) => uploadImageToS3(image));

      const newPost = {
        content,
        embedVideo,
        userID: currentUserId,
        images: images ? await Promise.all(images) : [],
      };

      const post = await ProfilePosts.create(newPost);

      user.publications.push(post._id);

      await user.save();

      return res.status(200).send({
        message: "Paylaşım başarıyla oluşturuldu.",
        publications: post,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("Paylaşım yapılırken bir hata meydana geldi.");
    }
  },

  async getAllPosts(req, res) {
    const { page, limit, category, type, search } = req.query;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    try {
      const posts = await ProfilePosts.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("user", "name lastname username");

      const totalPosts = await ProfilePosts.countDocuments(query);

      if (!posts || posts.length === 0) {
        return res.status(404).send({
          message: "İçerik bulunamadı.",
          publications: [],
          totalPosts: 0,
          totalPages: 0,
          currentPage: 0,
        });
      }

      //const modifiedPosts = posts.map((post) => dtos.contentDto(post));

      if (search) {
        const filteredPosts = posts.filter((post) =>
          post.content.toLowerCase().includes(search.toLowerCase())
        );

        return res.status(200).send({
          publications: filteredPosts,
          totalPosts: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / limitNumber),
          currentPage: pageNumber,
        });
      }

      res.status(200).send({
        publications: posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limitNumber),
        currentPage: pageNumber,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("İçerikler getirilirken bir hata meydana geldi.");
    }
  },

  async contentActionHandler(req, res) {
    const { contentId } = req.params;
    const { action } = req.body;

    const { _id } = req.user;

    try {
      const findPost = await ProfilePosts.findById(contentId).populate(
        "userID",
        "name lastname username"
      );
      if (!findPost) {
        return res.status(404).json({ error: "İçerik bulunamadı." });
      }

      switch (action) {
        case "like":
          if (findPost.likes.includes(_id)) {
            findPost.likes = findPost.likes.filter(
              (id) => id.toString() !== _id
            );
          } else {
            findPost.likes.push(_id);
          }
          break;
        case "bookmark":
          if (findPost.savedBy.includes(_id)) {
            findPost.savedBy = findPost.savedBy.filter(
              (id) => id.toString() !== _id
            );
          } else {
            findPost.savedBy.push(_id);
          }
          break;
        default:
          break;
      }

      await findPost.save();

      res.status(200).json({ message: "İçerik güncellendi.", post: findPost });
    } catch (err) {
      return res.status(500).json({ error: "Bir hata oluştu." });
    }
  },

  async getPopularPosts(req, res) {
    try {
      const posts = await ProfilePosts.find()
        .limit(5)
        .populate("user", "name lastname username");

      if (!posts || posts.length === 0) {
        return res.status(404).send({
          message: "İçerik bulunamadı.",
          publications: [],
        });
      }

      res.status(200).send({
        publications: posts,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("İçerikler getirilirken bir hata meydana geldi.");
    }
  },
};

module.exports = controller;
