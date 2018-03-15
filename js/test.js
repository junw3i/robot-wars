const modalMessage = (title, message) => {
  $("#battleText1").text(message);
  $("#battleText2").text(title);
  $("#battleModal").modal("show");
}


let messageQueue;

$('#battleModal').on('hidden.bs.modal', function (e) {
  console.log("modal closed!");
  messageQueue.shift();
  console.log(messageQueue);
  if (messageQueue.length > 0) {
    modalMessage(messageQueue[0][0], messageQueue[0][1]);
  }
});


messageQueue = [
  ["hi", "bye"],
  ["hello", "world"],
  ["third", "message"]
];

modalMessage(messageQueue[0][0], messageQueue[0][1]);
