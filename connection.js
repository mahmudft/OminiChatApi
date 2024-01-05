import mongoose from "mongoose";

export async function createConnection(){
    await mongoose.connect('mongodb://localhost:27017/ominidb');
    return mongoose
}

