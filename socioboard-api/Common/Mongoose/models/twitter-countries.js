import twitterCountriesSchema from '../schemas/twitter-countries.schema.js';

class TwitterCountries {
  getAllCountries() {
    const returnOptions = {
      _id: 0,
      __v: 0,
    };

    return twitterCountriesSchema.find({}, returnOptions);
  }

  insertCountries(countries) {
    return twitterCountriesSchema.insertMany(countries);
  }
}

export default new TwitterCountries();
