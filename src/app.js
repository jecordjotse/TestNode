const express = require("express");
const bodyparser = require("body-parser");
const app = express();

const RestaurantDB = require("./restaurant");

const restaurants = new RestaurantDB();

app.use(bodyparser.json());

app.get("/restaurants", (request, response) => {
  if (!!restaurants) {
    response.send(restaurants.getAllNoIds());
  } else response.sendStatus(404);
});

app.post("/restaurant", (request, response) => {
  if (!!restaurants) {
    const restaurant = {
      name: request.body.name,
      position: request.body.position,
      category: request.body.category,
      rating: request.body.rating,
    };
    restaurants.add(restaurant, (err, doc) => {
      if (!err) response.status(201).json(doc);
      else {
        console.log(
          "Error in adding users: ",
          JSON.stringify(err, undefined, 2)
        );
        response.status(400).json({ message: err });
      }
    });
  } else response.sendStatus(404);
});

app.post("/restaurants", (request, response) => {
  if (!!restaurants) {
    const searchCrite = {
      category: request.body.category,
      orderPriority: request.body.orderPriority,
      distanceLimit: request.body.distanceLimit,
      position: request.body.position,
    };
    restaurants.getRestaurantsOnCrite(searchCrite, (err, docs) => {
      if (!err) response.status(200).json(docs);
      else {
        console.log(
          "Error in adding users: ",
          JSON.stringify(err, undefined, 2)
        );
        response.status(400).json({ message: err });
      }
    });
  } else response.sendStatus(404);
});

app.delete("/restaurants", (request, response) => {
  if (!!restaurants) {
    restaurants.deleteAllEntry((err, doc) => {
      if (!err) response.sendStatus(204);
      else {
        console.log(
          "Error in deleting users: ",
          JSON.stringify(err, undefined, 2)
        );
        response.status(400).json({ message: err });
      }
    });
  } else response.sendStatus(404);
});

app.listen(4000, () => {
  console.log("Server started at port: 4000");
  console.log();
});

module.exports = app;
