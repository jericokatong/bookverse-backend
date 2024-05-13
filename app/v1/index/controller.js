const index = async (req, res) => {
  res.json({
    message: 'Welcome to BookVerse API test 1',
  });
};

module.exports = {
  index,
};
