// MongoDB skript för att uppdatera alla "Valhallav." till "Valhallavägen"
// För att köra: mongo mongodb+srv://mikaelengvallmemongo:9zc74rs1hDIHdWV0@dftm-cluster.mny99.mongodb.net/dfrm updateStreet.js

print("Uppdaterar alla förekomster av 'Valhallav.' till 'Valhallavägen'...");

// Uppdatera alla dokument i 'apartments'-samlingen
var updateResult = db.apartments.updateMany(
  { street: "Valhallav." },
  { $set: { street: "Valhallavägen" } }
);

print("Uppdatering slutförd.");
print("Matchade dokument: " + updateResult.matchedCount);
print("Uppdaterade dokument: " + updateResult.modifiedCount);

// Lista alla lägenheter på Valhallavägen för att verifiera ändringen
print("\nLägenheter på Valhallavägen efter uppdatering:");
db.apartments.find({ street: "Valhallavägen" }).forEach(function(doc) {
  print("ID: " + doc._id + ", Adress: " + doc.street + " " + doc.number + ", Lägenhetsnr: " + doc.apartmentNumber);
}); 