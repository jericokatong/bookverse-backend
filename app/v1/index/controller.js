const index = async (req, res) => {
  res.json({
    message: 'Welcome to BookVerse API test 5',
  });
};

module.exports = {
  index,
};
