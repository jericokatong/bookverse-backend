const index = async (req, res) => {
  res.json({
    message: 'Welcome to BookVerse API',
  });
};

module.exports = {
  index,
};
