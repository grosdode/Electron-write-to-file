const el = {
  createDocumentBtn: document.getElementById("createDocument"),
  writeToDocumentBtn: document.getElementById("writeToDocument"),
};

el.createDocumentBtn.addEventListener("click" , () => {
  console.log("createDocument clicked");
  window.api.send("createDocumentTriggerd", "createDocument"); 
})

el.writeToDocumentBtn.addEventListener("click", () => {
  console.log("writeToDocumentBtn clicked");
  window.api.send("writeToDocument", "new text\n");
});

window.api.receive("documentCreated", (data) => {
  console.log(data);
});