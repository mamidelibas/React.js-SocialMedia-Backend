const userDto = (contentParam) => {
  const {
    _id,
    name,
    lastname,
    username,
    email,
    achievement,
    userFollowers,
    following,
    bio,
    profilePhoto,
    coverPhoto,
    joinedGroups,
    createdContents,
    publications,
  } = contentParam;
  return {
    _id,
    name,
    lastname,
    username,
    email,
    joinedGroups,
    achievement,
    userFollowers,
    following,
    bio,
    profilePhoto,
    coverPhoto,
    createdContents,
    publications,
  };
};

module.exports = userDto;
