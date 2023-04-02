const express = require("express");
const jsonfile = require("jsonfile");
const cors = require("cors");
const data = require("./data.json");
const bodyParser = require("body-parser");

const file = "data.json";
const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`app listening on port ${port}!`);
});

// Get all contacts
app.get("/contacts", (req, res) => {
  res.json(data.contacts);
});

// add a new contact
app.post('/contacts', (req, res) => {
  const newContact = {
    id: data.contacts.length + 1,
    name: req.body.name,
    phoneNumber: req.body.phoneNumber
  };
  
  data.contacts.push(newContact);
  jsonfile.writeFileSync(file, data);

  res.json(newContact);
});


// Get a specific contact by ID
app.get("/contacts/:id", (req, res) => {
  const { id } = req.params;
  const contact = data.contacts.find((contact) => contact.id === Number(id));
  if (!contact) {
    res.sendStatus(404);
  } else {
    res.json(contact);
  }
});

// Get all calls
app.get("/calls", (req, res) => {
  const calls = data.calls.map((call) => {
    const contact = data.contacts.find(
      (contact) => contact.id === call.callerId
    );
    return {
      ...call,
      callerName: contact.name,
      callerPhoneNumber: contact.phoneNumber,
    };
  });
  res.json(calls);
});

// Update an existing contact
app.put("/contacts/:id", (req, res) => {
  const contact = data.contacts.find((c) => c.id == req.params.id);
  if (contact) {
    contact.name = req.body.name || contact.name;
    contact.phoneNumber = req.body.phoneNumber || contact.phoneNumber;
    jsonfile.writeFileSync(file, data);
    res.json(contact);
  } else {
    res.status(404).send("Contact not found");
  }
});

// Delete a contact
app.delete("/contacts/:id", (req, res) => {
  const contactIndex = data.contacts.findIndex((c) => c.id == req.params.id);
  if (contactIndex >= 0) {
    // Remove the contact from the contacts array
    const deletedContact = data.contacts.splice(contactIndex, 1)[0];

    // Remove any calls associated with the contact
    data.calls = data.calls.filter((c) => c.callerId != req.params.id);

    jsonfile.writeFileSync(file, data);
    res.json(deletedContact);
  } else {
    res.status(404).send("Contact not found");
  }
});
