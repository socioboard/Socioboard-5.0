import mongoose from 'mongoose';

const twitterCountries = new mongoose.Schema({
  name: { type: String },
  placeType: {
    code: { type: Number },
    name: { type: String },
  },
  url: { type: String },
  parentid: { type: Number },
  country: { type: String },
  woeid: { type: Number },
  countryCode: { type: String },
});

export default mongoose.model('twittercountries', twitterCountries);
