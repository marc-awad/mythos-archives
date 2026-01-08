import mongoose from "mongoose"

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string)

    console.log(`MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected")
    })
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error}`)
    process.exit(1)
  }
}

export default connectDB
