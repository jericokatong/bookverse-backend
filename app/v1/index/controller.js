const index = async (req, res) => {
  res.json({
    message: 'Welcome to BookVerse API test 2',
  });
};

module.exports = {
  index,
};
