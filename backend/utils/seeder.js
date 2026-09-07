const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

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
      seats: Array.from({length:40},(_,i) => ({ seatNumber:`A${i+1}`, type:i%4===0?'window':'aisle', deck:'lower', isAvailable:true, price:450 })) },

    { busNumber: 'TN02-SL-002', busName: 'Coimbatore Sleeper', operator: 'SRS Travels', busType: 'Sleeper', totalSeats: 36, rating: 4.2, totalReviews: 85,
      amenities: ['WiFi','Blanket','Reading Light'], features: { wifi:true,ac:true,charging:true,gps:false,ccCamera:true },
      images: ['bus5.png'],
      seats: Array.from({length:36},(_,i) => ({ seatNumber:`S${i+1}`, type:'window', deck:i<18?'lower':'upper', isAvailable:true, price:650 })) },

    { busNumber: 'TN03-VL-003', busName: 'Madurai Volvo', operator: 'KPN Travels', busType: 'Volvo', totalSeats: 45, rating: 4.8, totalReviews: 200,
      amenities: ['WiFi','USB','Entertainment','Snacks'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus6.png'],
      seats: Array.from({length:45},(_,i) => ({ seatNumber:`V${i+1}`, type:i%3===0?'window':'aisle', deck:'lower', isAvailable:true, price:800 })) },

    { busNumber: 'TN04-LX-004', busName: 'VIP Luxury Liner', operator: 'Orange Tours', busType: 'Luxury', totalSeats: 30, rating: 4.9, totalReviews: 95,
      amenities: ['WiFi','Meal','Blanket','Charging','TV'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus5.png'],
      seats: Array.from({length:30},(_,i) => ({ seatNumber:`L${i+1}`, type:i%2===0?'window':'aisle', deck:'lower', isAvailable:true, price:1200 })) },

    { busNumber: 'TN05-AC-005', busName: 'Nilgiri Queen', operator: 'Parveen Travels', busType: 'AC', totalSeats: 40, rating: 4.3, totalReviews: 90,
      amenities: ['WiFi','Charging'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus4.png'],
      seats: Array.from({length:40},(_,i) => ({ seatNumber:`N${i+1}`, type:i%4===0?'window':'aisle', deck:'lower', isAvailable:true, price:400 })) },

    { busNumber: 'TN06-VL-006', busName: 'Rock Fort Express', operator: 'YBM Travels', busType: 'Volvo', totalSeats: 45, rating: 4.4, totalReviews: 110,
      amenities: ['WiFi','Snacks'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus6.png'],
      seats: Array.from({length:45},(_,i) => ({ seatNumber:`R${i+1}`, type:i%3===0?'window':'aisle', deck:'lower', isAvailable:true, price:500 })) },

    { busNumber: 'TN07-NA-007', busName: 'Budget Rider', operator: 'SETC', busType: 'Non-AC', totalSeats: 50, rating: 3.9, totalReviews: 60,
      amenities: ['Charging'], features: { wifi:false,ac:false,charging:true,gps:false,ccCamera:false },
      images: ['bus4.png'],
      seats: Array.from({length:50},(_,i) => ({ seatNumber:`B${i+1}`, type:i%4===0?'window':'aisle', deck:'lower', isAvailable:true, price:220 })) },

    { busNumber: 'TN08-SL-008', busName: 'Comfort Sleeper', operator: 'National Travels', busType: 'Sleeper', totalSeats: 34, rating: 4.1, totalReviews: 70,
      amenities: ['WiFi','Blanket','Charging'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:false },
      images: ['bus5.png'],
      seats: Array.from({length:34},(_,i) => ({ seatNumber:`C${i+1}`, type:'window', deck:i<17?'lower':'upper', isAvailable:true, price:600 })) },

    { busNumber: 'TN09-VL-009', busName: 'Temple City Volvo', operator: 'Sri Lakshmi Travels', busType: 'Volvo', totalSeats: 42, rating: 4.6, totalReviews: 150,
      amenities: ['WiFi','USB','Snacks'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus4.png'],
      seats: Array.from({length:42},(_,i) => ({ seatNumber:`T${i+1}`, type:i%3===0?'window':'aisle', deck:'lower', isAvailable:true, price:750 })) },

    { busNumber: 'TN10-AC-010', busName: 'Marina Cruiser', operator: 'TNSTC', busType: 'AC', totalSeats: 38, rating: 4.4, totalReviews: 100,
      amenities: ['WiFi','USB Charging'], features: { wifi:true,ac:true,charging:true,gps:true,ccCamera:true },
      images: ['bus6.png'],
      seats: Array.from({length:38},(_,i) => ({ seatNumber:`M${i+1}`, type:i%4===0?'window':'aisle', deck:'lower', isAvailable:true, price:470 })) }
  ]);
  console.log('Buses created:', buses.length);

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  await Route.create([
    // Chennai -> Coimbatore (2 options)
    { from:'Chennai', to:'Coimbatore', bus:buses[0]._id, departureTime:'22:00', arrivalTime:'06:00', duration:'8h', distance:500, basePrice:450, availableDays:days,
      stops:[{city:'Vellore',departureTime:'23:30',distanceFromOrigin:145},{city:'Salem',departureTime:'01:30',distanceFromOrigin:340}] },
    { from:'Chennai', to:'Coimbatore', bus:buses[7]._id, departureTime:'09:00', arrivalTime:'17:00', duration:'8h', distance:500, basePrice:430, availableDays:days,
      stops:[{city:'Salem',departureTime:'13:00',distanceFromOrigin:340}] },
      // Chennai -> Coimbatore (2 options)
    { from:'Chennai', to:'Coimbatore', bus:buses[0]._id, departureTime:'22:00', arrivalTime:'06:00', duration:'8h', distance:500, basePrice:450, availableDays:days,
      stops:[{city:'Vellore',departureTime:'23:30',distanceFromOrigin:145},{city:'Salem',departureTime:'01:30',distanceFromOrigin:340}] },
    { from:'Chennai', to:'Coimbatore', bus:buses[7]._id, departureTime:'09:00', arrivalTime:'17:00', duration:'8h', distance:500, basePrice:430, availableDays:days,
      stops:[{city:'Salem',departureTime:'13:00',distanceFromOrigin:340}] },

    // Chennai -> Ramanathapuram (2 options)
    { from:'Chennai', to:'Ramanathapuram', bus:buses[1]._id, departureTime:'21:00', arrivalTime:'05:30', duration:'8.5h', distance:462, basePrice:650, availableDays:days,
      stops:[{city:'Trichy',departureTime:'01:00',distanceFromOrigin:320}] },
    { from:'Chennai', to:'Ramanathapuram', bus:buses[8]._id, departureTime:'13:00', arrivalTime:'21:30', duration:'8.5h', distance:462, basePrice:620, availableDays:days,
      stops:[{city:'Trichy',departureTime:'17:00',distanceFromOrigin:320}] },

    // Coimbatore -> Chennai (2 options)
    { from:'Coimbatore', to:'Chennai', bus:buses[2]._id, departureTime:'20:00', arrivalTime:'04:30', duration:'8.5h', distance:500, basePrice:500, availableDays:days,
      stops:[{city:'Salem',departureTime:'22:00',distanceFromOrigin:160}] },
    { from:'Coimbatore', to:'Chennai', bus:buses[9]._id, departureTime:'08:00', arrivalTime:'16:30', duration:'8.5h', distance:500, basePrice:480, availableDays:days,
      stops:[{city:'Salem',departureTime:'10:00',distanceFromOrigin:160}] },

    // Chennai -> Vellore (2 options)
    { from:'Chennai', to:'Vellore', bus:buses[3]._id, departureTime:'06:00', arrivalTime:'09:30', duration:'3.5h', distance:145, basePrice:250, availableDays:days, stops:[] },
    { from:'Chennai', to:'Vellore', bus:buses[6]._id, departureTime:'14:00', arrivalTime:'17:30', duration:'3.5h', distance:145, basePrice:280, availableDays:days, stops:[] },

    // Madurai -> Chennai (2 options)
    { from:'Madurai', to:'Chennai', bus:buses[4]._id, departureTime:'19:00', arrivalTime:'03:30', duration:'8.5h', distance:462, basePrice:700, availableDays:days,
      stops:[{city:'Trichy',departureTime:'21:30',distanceFromOrigin:142}] },
    { from:'Madurai', to:'Chennai', bus:buses[1]._id, departureTime:'11:00', arrivalTime:'19:30', duration:'8.5h', distance:462, basePrice:680, availableDays:days,
      stops:[{city:'Trichy',departureTime:'13:30',distanceFromOrigin:142}] },

    // Chennai -> Trichy (2 options)
    { from:'Chennai', to:'Trichy', bus:buses[5]._id, departureTime:'23:00', arrivalTime:'05:00', duration:'6h', distance:320, basePrice:550, availableDays:days, stops:[] },
    { from:'Chennai', to:'Trichy', bus:buses[8]._id, departureTime:'10:00', arrivalTime:'16:00', duration:'6h', distance:320, basePrice:520, availableDays:days, stops:[] }
  ]);
  console.log('Routes created');

  console.log('\n✅ Seeding complete!');
  console.log('👤 Admin:  admin@busgo.com / admin123');
  console.log('👤 User:   user@busgo.com  / user123');
  process.exit();
};

seed().catch(e => { console.error(e); process.exit(1); });