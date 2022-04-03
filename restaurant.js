const fs = require("fs");

//Class for handling restaurant
class Restaurant {
  #id;
  #name;
  #position;
  #category;
  #rating;
  constructor(id, name, position, category, rating) {
    this.#id = id;
    this.#name = name;
    this.#position = position;
    this.#category = category;
    this.#rating = rating;
  }

  get(fieldName) {
    if (fieldName in this) {
      return this["#" + fieldName];
    }
    return undefined;
  }

  getJSON() {
    return JSON.parse(
      JSON.stringify({
        id: this.#id,
        name: this.#name,
        position: this.#position,
        category: this.#category,
        rating: this.#rating,
      })
    );
  }

  getJSONStr() {
    return JSON.stringify({
      name: this.#name,
      position: this.#position,
      category: this.#category,
      rating: this.#rating,
    });
  }
}

//Class for handling restaurant database
class RestaurantList {
  #data = [];
  #error;
  #lastEntry = {};
  #searchCrite = {};
  #searchData = [];
  constructor() {
    this.#data = require("./db.json");
  }

  #saveDB() {
    try {
      var jsonContent = JSON.stringify(this.#data);
      fs.writeFile("./db.json", jsonContent, "utf8", function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }

        console.log("JSON file has been saved.");
      });
    } catch (e) {
      this.#error = e;
    }
  }

  #checkAvailablePosition(position) {
    let contains = false;
    Object.keys(this.#data).some((key) => {
      contains = this.#data[key].position === position;
      if (contains) this.#error = "Position not available";
      return contains;
    });
    if (contains) this.#error = "Position not available";
    return contains;
  }

  #checkAvailableFields(
    obj,
    fields = ["name", "position", "category", "rating"]
  ) {
    let avail = fields.every(
      (element) => typeof obj[element] !== "undefined" || obj[element] === ""
    );
    if (!avail) this.#error = "There are missing fields";
    console.log("All Fields", avail, obj);
    return avail;
  }

  #checkAvailablePositionRange(position) {
    let avail = !isNaN(position) && position >= 1 && position <= 200;
    if (!avail) this.#error = "position must be an integer from 0 to 200";
    return avail;
  }

  #checkAvailableratingRange(rating) {
    let avail = !isNaN(rating) && rating >= 0 && rating <= 5;
    if (!avail) this.#error = "rating must be an integer from 0 to 5";
    return avail;
  }

  #checkDistanceLimit(distanceLimit = 30) {
    this.#searchCrite.distanceLimit = distanceLimit;
    let avail = !isNaN(distanceLimit);
    if (!avail) this.#error = "Distance limit should be an integer";
    return avail;
  }

  #checkOrderPriority(orderPriority) {
    let avail = orderPriority === "distance" || orderPriority === "rating";
    if (!avail)
      this.#error = "Order priority should be either distance or rating";
    return avail;
  }

  #validateEntry(restaurant) {
    return (
      this.#checkAvailableFields(restaurant) &&
      this.#checkAvailablePositionRange(restaurant.position) &&
      this.#checkAvailableratingRange(restaurant.rating) &&
      !this.#checkAvailablePosition(restaurant.position)
    );
  }

  #validateSearch(searchCrite) {
    this.#searchCrite = { ...searchCrite };
    return (
      this.#checkAvailableFields(searchCrite, [
        "category",
        "orderPriority",
        "position",
      ]) &&
      this.#checkDistanceLimit(searchCrite.distanceLimit) &&
      this.#checkOrderPriority(searchCrite.orderPriority) &&
      this.#checkAvailablePositionRange(searchCrite.position)
    );
  }

  add(
    restaurant, // add Restaurant object to <data> array
    callback
  ) {
    var id = this.#data[this.#data.length - 1].id + 1;
    //Check is position exists
    if (this.#validateEntry(restaurant)) {
      this.#lastEntry = new Restaurant(
        id,
        restaurant.name,
        restaurant.position,
        restaurant.category,
        restaurant.rating
      );
      this.#data.push(this.#lastEntry.getJSON());
    }

    this.#saveDB();
    if (typeof callback === "function") {
      callback(
        this.#error,
        typeof this.#error === "undefined" ? this.#lastEntry.getJSON() : {}
      );
      this.#error = undefined;
    }
  }

  getAll() {
    return this.#data;
  }

  getAllNoIds() {
    return this.#data.map((item) => {
      return {
        name: item.name,
        position: item.position,
        category: item.category,
        rating: item.rating,
      };
    });
  }

  getRestaurantsOnCrite(searchCrite, callback) {
    if (this.#validateSearch(searchCrite)) {
      this.#searchData = this.#data
        .map((item) => {
          return {
            name: item.name,
            position: item.position,
            category: item.category,
            rating: item.rating,
            distance: Math.abs(item.position - searchCrite.position),
          };
        })
        .filter(
          (item) =>
            item.category.toLowerCase() === searchCrite.category.toLowerCase()
        )
        .sort(function (a, b) {
          if (searchCrite.orderPriority === "rating")
            return b.rating - a.rating;
          else if (searchCrite.orderPriority === "distance")
            return a.distance - b.distance;
          else return a.id - b.id;
        });
      this.#searchData = this.#searchData.filter(
        (item) => item.distance < this.#searchCrite.distanceLimit
      );
      console.log("Search Data: ", this.#searchData);
      console.log("Data: ", this.#data);
      searchCrite;
      console.log("Search Criteria: ", this.#searchCrite);
    }
    if (typeof callback === "function") {
      callback(
        this.#error,
        typeof this.#error === "undefined" ? this.getSearchData() : {}
      );
      this.#error = undefined;
    }
  }

  getLastEntry() {
    return this.#lastEntry.getJSON();
  }

  getSearchData() {
    return this.#searchData;
  }

  deleteAllEntry(callback) {
    this.#data = [];
    this.#saveDB();
    if (typeof callback == "function") {
      callback(this.#error, "");
      this.#error = undefined;
    }
  }
}

module.exports = RestaurantList;
