const { MongoClient } = require('mongodb');

// Anslutning till MongoDB Atlas
const uri = "mongodb+srv://mikaelengvallmemongo:9zc74rs1hDIHdWV0@dftm-cluster.mny99.mongodb.net/?retryWrites=true&w=majority";
const dbName = "dfrm";

async function migrateTenantModel() {
  console.log("Ansluter till MongoDB Atlas...");
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Ansluten till MongoDB Atlas");
    
    const db = client.db(dbName);
    const tenantsCollection = db.collection("tenants");
    
    // 1. Hämta alla hyresgäster
    const tenants = await tenantsCollection.find({}).toArray();
    console.log(`Hittade ${tenants.length} hyresgäster.`);
    
    // Statistik för uppföljning
    let updatedCount = 0;
    let missingApartmentCount = 0;
    let alreadyMigratedCount = 0;
    
    // 2. Gå igenom varje hyresgäst och ta bort adressfälten
    for (const tenant of tenants) {
      // Kontrollera om hyresgästen redan har migrerats (saknar adressfält)
      const hasAddressFields = tenant.street !== undefined || 
                              tenant.postalCode !== undefined || 
                              tenant.city !== undefined;
      
      if (!hasAddressFields) {
        alreadyMigratedCount++;
        continue; // Hoppa över om den redan är migrerad
      }
      
      // Skapa en uppdatering som tar bort adressfält
      const update = {
        $unset: {
          street: "",
          postalCode: "",
          city: ""
        }
      };
      
      // Uppdatera hyresgästen
      const result = await tenantsCollection.updateOne(
        { _id: tenant._id },
        update
      );
      
      if (result.modifiedCount > 0) {
        updatedCount++;
      }
      
      // Visa vilka hyresgäster som inte har en kopplad lägenhet
      if (!tenant.apartment) {
        console.log(`Varning: Hyresgäst ${tenant.firstName} ${tenant.lastName} (${tenant._id}) har ingen kopplad lägenhet.`);
        missingApartmentCount++;
      }
    }
    
    console.log(`\nMigreringsresultat:`);
    console.log(`- Uppdaterade ${updatedCount} hyresgäster (adressfält borttagna)`);
    console.log(`- ${missingApartmentCount} hyresgäster saknar kopplad lägenhet`);
    console.log(`- ${alreadyMigratedCount} hyresgäster var redan migrerade`);
    
  } catch (err) {
    console.error("Ett fel inträffade:", err);
  } finally {
    await client.close();
    console.log("Anslutning stängd");
  }
}

// Kör migreringen
migrateTenantModel().catch(console.error); 