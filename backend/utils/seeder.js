const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// ---------- helper: generate seats with seatType + genderLock support ----------
function makeSeats(prefix, count, { price, seatType = 'seater', deckSplit = null }) {
  return Array.from({ length: count }, (_, i) => {
    const seatNumber = `${prefix}${i + 1}`;
    const deck = deckSplit ? (i < deckSplit ? 'lower' : 'upper') : 'lower';
    const type = seatType === 'sleeper' ? (i % 3 === 0 ? 'window' : 'aisle') : (i % 4 === 0 ? 'window' : 'aisle');

    let genderLock = 'none';
    const roll = Math.random();
    if (roll < 0.07) genderLock = 'male';
    else if (roll < 0.12) genderLock = 'female';

    const isAvailable = Math.random() > 0.12; // ~12% pre-booked for demo variety

    return { seatNumber, type, deck, seatType, genderLock, isAvailable, price };
  });
}

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected...');
  await Promise.all([User.deleteMany(), Bus.deleteMany(), Route.deleteMany()]);

  await User.create([
    { name: 'Admin User', email: 'admin@busgo.com', phone: '6369396941', password: 'vdlove143', role: 'admin', isVerified: true },
    { name: 'Test User', email: 'user@busgo.com', phone: '9677715305', password: 'user123', role: 'user', isVerified: true }
  ]);
  console.log('Users created');

  const buses = await Bus.create([
    { busNumber: 'TN01-AC-001', busName: 'Chennai Express', operator: 'TNSTC', busType: 'AC', totalSeats: 40, rating: 4.5, totalReviews: 120,
      amenities: ['WiFi','USB Charging','Water Bottle'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus4.png'],
      seats: makeSeats('A', 40, { price: 450 }) },

    { busNumber: 'TN02-SL-002', busName: 'Coimbatore Sleeper', operator: 'SRS Travels', busType: 'Sleeper', totalSeats: 36, rating: 4.2, totalReviews: 85,
      amenities: ['WiFi','Blanket','Reading Light'], features: { wifi:true,ac:true,charging:true,gps:false,ccCamera:true },
      images: ['bus5.png'],
      seats: makeSeats('S', 36, { price: 650, seatType: 'sleeper', deckSplit: 18 }) },

    { busNumber: 'TN03-VL-003', busName: 'Madurai Volvo', operator: 'KPN Travels', busType: 'Volvo', totalSeats: 45, rating: 4.8, totalReviews: 200,
      amenities: ['WiFi','USB','Entertainment','Snacks'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus6.png'],
      seats: makeSeats('V', 45, { price: 800 }) },

    { busNumber: 'TN04-LX-004', busName: 'VIP Luxury Liner', operator: 'Orange Tours', busType: 'Luxury', totalSeats: 30, rating: 4.9, totalReviews: 95,
      amenities: ['WiFi','Meal','Blanket','Charging','TV'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus5.png'],
      seats: makeSeats('L', 30, { price: 1200 }) },

    { busNumber: 'TN05-AC-005', busName: 'Nilgiri Queen', operator: 'Parveen Travels', busType: 'AC', totalSeats: 40, rating: 4.3, totalReviews: 90,
      amenities: ['WiFi','Charging'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus4.png'],
      seats: makeSeats('N', 40, { price: 400 }) },

    { busNumber: 'TN06-VL-006', busName: 'Rock Fort Express', operator: 'YBM Travels', busType: 'Volvo', totalSeats: 45, rating: 4.4, totalReviews: 110,
      amenities: ['WiFi','Snacks'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus6.png'],
      seats: makeSeats('R', 45, { price: 500 }) },

    { busNumber: 'TN07-NA-007', busName: 'Budget Rider', operator: 'SETC', busType: 'Non-AC', totalSeats: 50, rating: 3.9, totalReviews: 60,
      amenities: ['Charging'], features: { wifi:false,ac:false,charging:true,gps:false,ccCamera:false },
      images: ['bus4.png'],
      seats: makeSeats('B', 50, { price: 220 }) },

    { busNumber: 'TN08-SL-008', busName: 'Comfort Sleeper', operator: 'National Travels', busType: 'Sleeper', totalSeats: 34, rating: 4.1, totalReviews: 70,
      amenities: ['WiFi','Blanket','Charging'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:false },
      images: ['bus5.png'],
      seats: makeSeats('C', 34, { price: 600, seatType: 'sleeper', deckSplit: 17 }) },

    { busNumber: 'TN09-VL-009', busName: 'Temple City Volvo', operator: 'Sri Lakshmi Travels', busType: 'Volvo', totalSeats: 42, rating: 4.6, totalReviews: 150,
      amenities: ['WiFi','USB','Snacks'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus4.png'],
      seats: makeSeats('T', 42, { price: 750 }) },

    { busNumber: 'TN10-AC-010', busName: 'Marina Cruiser', operator: 'TNSTC', busType: 'AC', totalSeats: 38, rating: 4.4, totalReviews: 100,
      amenities: ['WiFi','USB Charging'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus6.png'],
      seats: makeSeats('M', 38, { price: 470 }) },

    // NEW: Semi-Sleeper (was completely missing before)
    { busNumber: 'TN11-SS-011', busName: 'Kaveri Semi-Sleeper', operator: 'Parveen Travels', busType: 'Semi-Sleeper', totalSeats: 36, rating: 4.3, totalReviews: 78,
      amenities: ['WiFi','Charging Port','Water Bottle'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:false },
      images: ['bus5.png'],
      seats: makeSeats('K', 36, { price: 550 }) },

    { busNumber: 'TN12-SS-012', busName: 'Pandiyan Semi-Sleeper', operator: 'YBM Travels', busType: 'Semi-Sleeper', totalSeats: 36, rating: 4.0, totalReviews: 55,
      amenities: ['Charging Port'], features: { wifi:false,ac:true,charging:true,gps:true,ccCamera:false },
      images: ['bus4.png'],
      seats: makeSeats('P', 36, { price: 530 }) }
  ]);
  console.log('Buses created:', buses.length);

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  await Route.create([
    // Chennai -> Coimbatore
    { from:'Chennai', to:'Coimbatore', bus:buses[0]._id, departureTime:'22:00', arrivalTime:'06:00', duration:'8h', distance:500, basePrice:450, availableDays:days,
      stops:[{city:'Vellore',departureTime:'23:30',distanceFromOrigin:145},{city:'Salem',departureTime:'01:30',distanceFromOrigin:340}] },
    { from:'Chennai', to:'Coimbatore', bus:buses[7]._id, departureTime:'09:00', arrivalTime:'17:00', duration:'8h', distance:500, basePrice:430, availableDays:days,
      stops:[{city:'Salem',departureTime:'13:00',distanceFromOrigin:340}] },
    { from:'Chennai', to:'Coimbatore', bus:buses[10]._id, departureTime:'15:00', arrivalTime:'23:00', duration:'8h', distance:500, basePrice:460, availableDays:days, stops:[] },

    // Chennai -> Madurai
    { from:'Chennai', to:'Madurai', bus:buses[1]._id, departureTime:'21:00', arrivalTime:'05:30', duration:'8.5h', distance:462, basePrice:650, availableDays:days,
      stops:[{city:'Trichy',departureTime:'01:00',distanceFromOrigin:320}] },
    { from:'Chennai', to:'Madurai', bus:buses[8]._id, departureTime:'13:00', arrivalTime:'21:30', duration:'8.5h', distance:462, basePrice:620, availableDays:days,
      stops:[{city:'Trichy',departureTime:'17:00',distanceFromOrigin:320}] },
    { from:'Chennai', to:'Madurai', bus:buses[11]._id, departureTime:'07:00', arrivalTime:'15:30', duration:'8.5h', distance:462, basePrice:600, availableDays:days, stops:[] },

    // Coimbatore -> Chennai
    { from:'Coimbatore', to:'Chennai', bus:buses[2]._id, departureTime:'20:00', arrivalTime:'04:30', duration:'8.5h', distance:500, basePrice:500, availableDays:days,
      stops:[{city:'Salem',departureTime:'22:00',distanceFromOrigin:160}] },
    { from:'Coimbatore', to:'Chennai', bus:buses[9]._id, departureTime:'08:00', arrivalTime:'16:30', duration:'8.5h', distance:500, basePrice:480, availableDays:days,
      stops:[{city:'Salem',departureTime:'10:00',distanceFromOrigin:160}] },

    // Chennai -> Vellore
    { from:'Chennai', to:'Vellore', bus:buses[3]._id, departureTime:'06:00', arrivalTime:'09:30', duration:'3.5h', distance:145, basePrice:250, availableDays:days, stops:[] },
    { from:'Chennai', to:'Vellore', bus:buses[6]._id, departureTime:'14:00', arrivalTime:'17:30', duration:'3.5h', distance:145, basePrice:280, availableDays:days, stops:[] },

    // Madurai -> Chennai
    { from:'Madurai', to:'Chennai', bus:buses[4]._id, departureTime:'19:00', arrivalTime:'03:30', duration:'8.5h', distance:462, basePrice:700, availableDays:days,
      stops:[{city:'Trichy',departureTime:'21:30',distanceFromOrigin:142}] },
    { from:'Madurai', to:'Chennai', bus:buses[1]._id, departureTime:'11:00', arrivalTime:'19:30', duration:'8.5h', distance:462, basePrice:680, availableDays:days,
      stops:[{city:'Trichy',departureTime:'13:30',distanceFromOrigin:142}] },

    // Chennai -> Trichy
    { from:'Chennai', to:'Trichy', bus:buses[5]._id, departureTime:'23:00', arrivalTime:'05:00', duration:'6h', distance:320, basePrice:550, availableDays:days, stops:[] },
    { from:'Chennai', to:'Trichy', bus:buses[8]._id, departureTime:'10:00', arrivalTime:'16:00', duration:'6h', distance:320, basePrice:520, availableDays:days, stops:[] },

    // NEW: Chennai -> Salem
    { from:'Chennai', to:'Salem', bus:buses[6]._id, departureTime:'22:30', arrivalTime:'05:00', duration:'6.5h', distance:340, basePrice:400, availableDays:days, stops:[] },
    { from:'Chennai', to:'Salem', bus:buses[10]._id, departureTime:'08:30', arrivalTime:'15:00', duration:'6.5h', distance:340, basePrice:380, availableDays:days, stops:[] },

    // NEW: Chennai -> Pondicherry
    { from:'Chennai', to:'Pondicherry', bus:buses[3]._id, departureTime:'07:00', arrivalTime:'10:30', duration:'3.5h', distance:160, basePrice:300, availableDays:days, stops:[] },
    { from:'Chennai', to:'Pondicherry', bus:buses[9]._id, departureTime:'16:00', arrivalTime:'19:30', duration:'3.5h', distance:160, basePrice:320, availableDays:days, stops:[] },

    // NEW: Chennai -> Tirunelveli
    { from:'Chennai', to:'Tirunelveli', bus:buses[2]._id, departureTime:'20:30', arrivalTime:'06:30', duration:'10h', distance:620, basePrice:850, availableDays:days,
      stops:[{city:'Madurai',departureTime:'04:30',distanceFromOrigin:462}] },
    { from:'Chennai', to:'Tirunelveli', bus:buses[11]._id, departureTime:'18:00', arrivalTime:'04:00', duration:'10h', distance:620, basePrice:820, availableDays:days, stops:[] },

    // NEW: Coimbatore -> Madurai
    { from:'Coimbatore', to:'Madurai', bus:buses[5]._id, departureTime:'09:00', arrivalTime:'14:00', duration:'5h', distance:210, basePrice:420, availableDays:days, stops:[] },

    // NEW: Trichy -> Salem
    { from:'Trichy', to:'Salem', bus:buses[7]._id, departureTime:'12:00', arrivalTime:'15:30', duration:'3.5h', distance:150, basePrice:280, availableDays:days, stops:[] },

    // NEW: Salem -> Vellore
    { from:'Salem', to:'Vellore', bus:buses[10]._id, departureTime:'17:00', arrivalTime:'20:00', duration:'3h', distance:130, basePrice:260, availableDays:days, stops:[] }
  ]);
  console.log('Routes created');

  console.log('\n✅ Seeding complete!');
  console.log('👤 Admin:  admin@busgo.com / vdlove143');
  console.log('👤 User:   user@busgo.com  / user123');
  process.exit();
};

seed().catch(e => { console.error(e); process.exit(1); });