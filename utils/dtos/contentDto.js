const contentDto = (contentParam) => {
  const {
    _id,
    viewCount,
    title,
    type,
    slug,
    category,
    images,
    content,
    summary,
    thumbnail,
    userID,
    status,
    createdAt,
    likedBy,
    savedBy,
    updatedAt,
    listContent,
    pollContent,
    quizContent,
    testContent,
    hashtags,
    embedVideo,
  } = contentParam;
  return {
    _id,
    viewCount,
    title,
    type,
    slug,
    category,
    images,
    content,
    summary,
    thumbnail,
    userID,
    status,
    createdAt,
    likedBy,
    savedBy,
    updatedAt,
    listContent,
    pollContent,
    quizContent,
    testContent,
    hashtags,
    embedVideo,
  };
};

module.exports = contentDto;