const { uploadImageToS3 } = require("../services/uploadService");
const Users = require("../models/User");
const ProfilePosts = require("../models/ProfilePosts");
const dtos = require("../utils/dtos/index");
const bcrypt = require("bcryptjs");

const controller = {
  async getUsers(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = 10;

      const currentUserId = req?.user?._id;

      const getUsers = await Users.find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ userFollowers: -1 });
      const count = await Users.countDocuments({});
      const users = getUsers.map((user) => {
        user.isFollowing = user?.userFollowers?.includes(currentUserId);
        const userDto = dtos.userDto(user);
        return userDto;
      });
      res.status(200).json({ users, count });
    } catch (error) {
      console.log(error);
      res.status(400).send("Kullanıcılar getirilirken bir hata meydana geldi.");
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const currentUserId = req?.user?._id;

      const getUsers = await Users.find({}).sort({ createdAt: -1 });
      const count = await Users.countDocuments({});
      const users = getUsers.map((user) => {
        user.isFollowing = user?.userFollowers?.includes(currentUserId);
        user.password = undefined;
        return user;
      });
      res.status(200).json({ users, count });
    } catch (error) {
      console.log(error);
      res.status(400).send("Kullanıcılar getirilirken bir hata meydana geldi.");
    }
  },

  async followUser(req, res) {
    const { userId } = req.params;
    const currentUserId = req?.user?._id;

    if (!userId || !currentUserId) {
      return res.status(400).send("Eksik parametre.");
    }

    try {
      if (userId === currentUserId) {
        return res.status(400).send("Kendini takip edemezsin.");
      }

      const reciepentUser = await Users.findById(userId);
      const currentUser = await Users.findById(currentUserId);

      if (!reciepentUser || !currentUser) {
        return res.status(404).send("Kullanıcı bulunamadı.");
      }

      const isFollowing = reciepentUser.userFollowers.includes(currentUserId);

      if (isFollowing) {
        reciepentUser.userFollowers.pull(currentUserId);
        currentUser.following.pull(userId);
        await reciepentUser.save();
        await currentUser.save();
        return res.status(200).send(reciepentUser);
      } else {
        reciepentUser.userFollowers.push(currentUserId);
        currentUser.following.push(userId);
        await reciepentUser.save();
        await currentUser.save();
        return res.status(200).send(reciepentUser);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("Kullanıcı takip edilirken bir hata meydana geldi.");
    }
  },

  async getUser(req, res) {
    const { username } = req.params;
    try {
      const user = await Users.findOne({ username })
        .populate("publications", "content images likes createdAt")
        .populate("userFollowers", "name lastname username")
        .populate("following", "name lastname username")
        .exec()
        .catch((err) => {
          console.log("hataaaaa", err);
        });

      if (!user) {
        res.status(404).send({ error: "Kullanıcı bulunamadı." });
      }
      const userDto = dtos.userDto(user);
      res.status(200).json(userDto);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .send("Kullanıcı bilgileri getirilirken bir hata meydana geldi.");
    }
  },

  async updateUser(req, res) {
    const { username, name, lastname, currentPassword, password } = req.body;
    let newUserInfo = {};

    const currentUserId = req?.user?._id;

    if (!currentUserId) {
      return res.status(400).send("Eksik parametre.");
    }

    try {
      const user = await Users.findById(currentUserId);

      if (!user) {
        return res.status(404).send("Kullanıcı bulunamadı.");
      }

      if (username && username !== user.username && username.length > 0) {
        const isUsernameTaken = await Users.find({
          username,
        })
          .countDocuments()
          .then((count) => count > 0);

        if (isUsernameTaken) {
          return res.status(400).send({
            message: "Bu kullanıcı adı zaten alınmış.",
          });
        }

        newUserInfo.username = username;
      }

      newUserInfo.name = name;
      newUserInfo.lastname = lastname;

      if (currentPassword && password) {
        const isPasswordMatch = await bcrypt.compare(
          currentPassword,
          user.password
        );

        if (!isPasswordMatch) {
          return res.status(400).send({
            message: "Şu anki şifreniz yanlış.",
          });
        }

        newUserInfo.password = await bcrypt.hash(password, 8);
      }

      await Users.findByIdAndUpdate(currentUserId, newUserInfo, {
        new: true,
      });

      const updatedUser = await Users.findById(currentUserId);

      return res.status(200).send({
        message: "Kullanıcı bilgileri güncellendi.",
        user: dtos.userDto(updatedUser),
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("Kullanıcı güncellenirken bir hata meydana geldi.");
    }
  },

  async deleteUser(req, res) {
    const currentUserId = req?.user?._id;

    if (!currentUserId) {
      return res.status(400).send("Eksik parametre.");
    }

    try {
      const user = await Users.findById(currentUserId);

      if (!user) {
        return res.status(404).send("Kullanıcı bulunamadı.");
      }

      await Users.findByIdAndDelete(currentUserId);

      return res.status(200).send({
        message: "Kullanıcı başarıyla silindi.",
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("Kullanıcı silinirken bir hata meydana geldi.");
    }
  },
};
module.exports = controller;
