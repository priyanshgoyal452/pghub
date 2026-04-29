const mongoose = require('mongoose');
const PG = require('./models/PG');
const Inquiry = require('./models/Inquiry');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pghub';

const mockPGs = [
  {
    name: "Stanza Living - Kingsway House",
    address: "Plot 42, North Campus Knowledge Park",
    location: "North Campus, Delhi",
    rent: 14500,
    facilities: ["High-speed WiFi", "Air Conditioning", "3 Meals Included", "Daily Cleaning", "Gym"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200", "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=1200"],
    contactDetails: { phone: "+91 9876543210", email: "hello@stanzaliving.com" },
    gender: "Boys",
    status: "Approved"
  },
  {
    name: "CoHo Elite Girls Residence",
    address: "Block A, Near South Campus Metro",
    location: "South Campus, Delhi",
    rent: 16000,
    facilities: ["WiFi", "AC", "Security 24x7", "Power Backup", "Washing Machine"],
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200", "https://images.unsplash.com/photo-1522771731478-44ba10e58d77?q=80&w=1200"],
    contactDetails: { phone: "+91 9123456780", email: "support@coho.in" },
    gender: "Girls",
    status: "Approved"
  },
  {
    name: "Zolo Premium Coliving",
    address: "Tower 3, Cyber City Hub",
    location: "DLF Phase 3, Gurugram",
    rent: 18500,
    facilities: ["Central AC", "Swimming Pool", "Lounge", "Smart TV", "Food"],
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200", "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200"],
    contactDetails: { phone: "+91 9988776655", email: "bookings@zolostays.com" },
    gender: "Co-ed",
    status: "Approved"
  },
  {
    name: "Oxford Scholars Home",
    address: "B-21, University Enclave",
    location: "North Campus, Delhi",
    rent: 9500,
    facilities: ["WiFi", "RO Water", "Library", "Terrace Garden"],
    images: ["https://images.unsplash.com/photo-1499955085172-a104c9463ece?q=80&w=1200", "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200"],
    contactDetails: { phone: "+91 8877665544", email: "oxfordhome@gmail.com" },
    gender: "Boys",
    status: "Approved"
  },
  {
    name: "Paradise Girls PG",
    address: "7th Cross Road, Satellite Town",
    location: "Koramangala, Bangalore",
    rent: 12000,
    facilities: ["WiFi", "Attached Washroom", "Washing Machine", "Security"],
    images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=1200"],
    contactDetails: { phone: "+91 7766554433" },
    gender: "Girls",
    status: "Approved"
  },
  {
    name: "Nexus Coliving Space",
    address: "Sector 62, Near IT Park",
    location: "Sector 62, Noida",
    rent: 22000,
    facilities: ["Studio Rooms", "AC", "Pantry", "Gym", "Gaming Room"],
    images: ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"],
    contactDetails: { phone: "+91 6655443322", email: "admin@nexuscolive.com" },
    gender: "Co-ed",
    status: "Approved"
  }
];

const mockInquiries = [
  { studentName: 'Rohan Sharma', contactNumber: '+91 9988776655', budget: 12000, preferredArea: 'North Campus', sharingType: 'Shared', gender: 'Boys', consentToPublish: true },
  { studentName: 'Priya Patel', contactNumber: '+91 8877665544', budget: 18000, preferredArea: 'Koramangala', sharingType: 'Single', gender: 'Girls', consentToPublish: true },
  { studentName: 'Aman Gupta', contactNumber: '+91 7766554433', budget: 10000, preferredArea: 'Sector 62', sharingType: 'Shared', gender: 'Boys', consentToPublish: true }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB for seeding');
    await PG.deleteMany({});
    await Inquiry.deleteMany({});
    await PG.insertMany(mockPGs);
    await Inquiry.insertMany(mockInquiries);
    console.log('Dummy data inserted');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
