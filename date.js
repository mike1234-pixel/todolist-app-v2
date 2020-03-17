// no parentheses as we don't want to call the function here.
// we want app.js to determine when that function should be called.
module.exports = getDate;

function getDate() {
  const today = new Date();
  const currentDay = today.getDay();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  // in the toLocalDateString method we pass in our options to format the date string
  return today.toLocaleDateString("en-US", options);
}
