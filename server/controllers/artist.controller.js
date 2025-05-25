const Artist = require('../models/Artist');

exports.getAllArtists = async (req, res) => {
  const data = await Artist.find().sort({ createdAt: -1 });
  res.json(data);
};

exports.createArtist = async (req, res) => {
  const { fullname } = req.body;
  const avatar = req.file?.filename || null;
  const artist = new Artist({ fullname, avatar });
  await artist.save();
  res.json(artist);
};

exports.updateArtist = async (req, res) => {
  const { fullname } = req.body;
  const updateData = { fullname };
  if (req.file) updateData.avatar = req.file.filename;
  const updated = await Artist.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json(updated);
};

exports.deleteArtist = async (req, res) => {
  await Artist.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};
