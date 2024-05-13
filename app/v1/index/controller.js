const index = async (req, res) => {
  res.json({
    message: 'Welcome to BookVerse API test 3',
  });
};

module.exports = {
  index,
};
