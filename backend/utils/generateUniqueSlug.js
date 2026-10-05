const slugify = require('slugify');
const Broker = require('../models/Broker'); 

const generateUniqueSlug = async (name) => {
  let baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  while (await Broker.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};

// This line is likely missing or incorrect!
module.exports = generateUniqueSlug;