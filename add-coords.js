import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js';

dotenv.config();

async function addCoords() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        // Update all reports without coordinates
        const result = await Report.updateMany(
            { lat: { $exists: false } },
            {
                $set: {
                    lat: 27.1303, // Gonda coords
                    lng: 81.9669,
                    // If address is missing, add a default one
                    address: "Gonda City Center"
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} reports with coordinates.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addCoords();
