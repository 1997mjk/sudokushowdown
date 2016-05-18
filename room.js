function Room(name, id, owner, number) {  
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.status = "available";
  this.number = number;
};

Room.prototype.addPerson = function(personID) {  
  if (this.status === "available") {
    this.people.push(personID);
  }
};

module.exports = Room;  