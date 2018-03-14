const modalMessage = (title, message) => {
  $("#battleText1").text(message);
  $("#battleText2").text(title);
  $("#battleModal").modal("show");
}

const modalMessage("hi", "message");
