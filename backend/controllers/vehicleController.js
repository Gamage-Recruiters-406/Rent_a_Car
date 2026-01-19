import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Vehicle from "../models/Vehicle.js";

const removeDirSafe = (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (_) {
    // ignore cleanup errors
  }
};

export const createVehicleListing = async (req, res) => {
  let tempDir = req._uploadTempDir;

  try {
    const ownerId = req.user?.userid; // from JWT payload
    if (!ownerId) {
      // cleanup temp if exists
      if (tempDir) removeDirSafe(tempDir);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, numberPlate, model, year, fuelType, amount } = req.body;

    if (!title || !numberPlate || !model || !year || !fuelType) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(400).json({
        success: false,
        message: "title, numberPlate, model, year, fuelType are required.",
      });
    }

    if (!req.files || req.files.length === 0) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(400).json({
        success: false,
        message: "At least 1 photo is required (photos).",
      });
    }

    // 1) Create vehicle first WITHOUT photos (so we can get _id)
    const vehicle = await Vehicle.create({
      ownerId,
      title: title.trim(),
      description: description || "",
      numberPlate: numberPlate.trim(),
      model: model.trim(),
      year: Number(year),
      fuelType,
      amount: amount !== undefined && amount !== "" ? Number(amount) : null,
      photos: [], // will update after moving files
    });

    // 2) Move uploaded files from temp folder -> uploads/<vehicleId>/
    const vehicleId = vehicle._id.toString();

    const uploadRoot = path.join(process.cwd(), "uploads");
    const destDir = path.join(uploadRoot, vehicleId);

    // Create uploads and vehicleId folder
    fs.mkdirSync(destDir, { recursive: true });

    const photos = [];

    for (const f of req.files) {
      const oldPath = f.path; // temp path from multer
      const newPath = path.join(destDir, f.filename);

      // move file
      fs.renameSync(oldPath, newPath);

      photos.push({
        url: `/uploads/${vehicleId}/${f.filename}`,
        key: f.filename,
      });
    }

    // 3) Update vehicle photos
    vehicle.photos = photos;
    await vehicle.save();

    // 4) Remove temp folder (now should be empty)
    if (tempDir) removeDirSafe(tempDir);

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      vehicle,
    });
  } catch (error) {
    console.log("CREATE VEHICLE ERROR:", error);

    // cleanup temp folder on error
    if (tempDir) removeDirSafe(tempDir);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate number plate for this owner.",
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error",
    });
  }
};