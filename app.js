const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

console.log(date());

const app = express();

//var items = [];
//var workItems = [];

// this tells our app to use ejs as its view engine
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect(
  "[LOCAL HOST/ATLAS CONNECTION],
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }
);

//schema
const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
};

//mongoose model
const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

// new list items
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// use mongoose find() method to grab the data from the database so we can pass it to list.ejs

// if the length of foundItems array is 0, we insert the default items
// otherwise we just display whatever user added items are in the array
// we then redirect to "/" at the end, we will go through the control statement again but it will go straight to the res.render() at the end
app.get("/", function(req, res) {
  let day = date();

  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added items to todolistDB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const passedItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    passedItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function(err, foundList) {
      foundList.items.push(passedItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ _id: checkedItemId }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("item successfully deleted");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// using express route parameters to create dynamic lists
// if list with param name already exists, just display it
// if it does not exist, create a new one using the defaultItems
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
