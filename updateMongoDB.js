const { MongoClient } = require('mongodb');

// Anslutning till MongoDB Atlas
const uri = "mongodb+srv://mikaelengvallmemongo:9zc74rs1hDIHdWV0@dftm-cluster.mny99.mongodb.net/?retryWrites=true&w=majority";
const dbName = "dfrm";

async function updateStreetNames() {
  console.log("Ansluter till MongoDB Atlas...");
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Ansluten till MongoDB Atlas");
    
    const db = client.db(dbName);
    const apartmentsCollection = db.collection("apartments");
    
    // Uppdatera "Landbrogatan 31 A" till "Landbrogatan 31A"
    console.log("Uppdaterar Landbrogatan 31 A/B format...");
    
    // Hämta alla lägenheter på Landbrogatan
    const landbrogatanApartments = await apartmentsCollection.find({
      street: "Landbrogatan",
      number: { $in: ["31 A", "31 B"] }
    }).toArray();
    
    console.log(`Antal lägenheter på Landbrogatan 31 A/B hittade: ${landbrogatanApartments.length}`);
    
    // Uppdatera varje lägenhet individuellt
    let updatedCount = 0;
    
    for (const apartment of landbrogatanApartments) {
      const currentNumber = apartment.number;
      const newNumber = currentNumber.replace(" ", ""); // Ta bort mellanslag
      
      const updateResult = await apartmentsCollection.updateOne(
        { _id: apartment._id },
        { $set: { number: newNumber } }
      );
      
      if (updateResult.modifiedCount > 0) {
        updatedCount++;
        console.log(`Uppdaterade lägenhet ${apartment._id}: ${currentNumber} -> ${newNumber}`);
      }
    }
    
    console.log(`Totalt uppdaterat ${updatedCount} lägenheter.`);
    
    // Lista uppdaterade lägenheter
    const updatedApartments = await apartmentsCollection.find({
      street: "Landbrogatan",
      number: { $in: ["31A", "31B"] }
    }).toArray();
    
    if (updatedApartments.length > 0) {
      console.log("\nLägenheter på Landbrogatan efter uppdateringen:");
      updatedApartments.forEach((apt, i) => {
        console.log(`${i+1}. ID: ${apt._id}, Adress: ${apt.street} ${apt.number || ''}, Lägenhet: ${apt.apartmentNumber || ''}`);
      });
    } else {
      console.log("Inga lägenheter hittades på Landbrogatan 31A/31B.");
    }
    
  } catch (err) {
    console.error("Ett fel inträffade:", err);
  } finally {
    await client.close();
    console.log("Anslutning stängd");
  }
}

// Kör funktionen
updateStreetNames().catch(console.error); 