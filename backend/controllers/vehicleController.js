import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Vehicle from "../models/Vehicle.js";
import { request } from "http";

const removeDirSafe = (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (_) {}
};

const removeFileSafe = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_) {}
};



// CREATE VEHICLE LISTING
export const createVehicleListing = async (req, res) => {
  let tempDir = req._uploadTempDir;
  let vehicle = null;

  try {
    const ownerId = req.user?.userid; // from JWT payload
    if (!ownerId) {
      // cleanup temp if exists
      if (tempDir) removeDirSafe(tempDir);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, numberPlate, model, vehicleType, year, fuelType, transmission, pricePerDay, pricePerKm, address, lat, lng } = req.body;

    if (!title || !numberPlate || !model || !vehicleType || !year || !fuelType || !transmission || pricePerDay === undefined || pricePerKm === undefined || lat === undefined || lng === undefined ) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(400).json({
        success: false,
        message: "Required: title, numberPlate, model, vehicleType, year, fuelType, transmission, pricePerDay, pricePerKm, lat, lng",
      });
    }

    if (!req.files || req.files.length === 0) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(400).json({
        success: false,
        message: "At least 1 photo is required (photos).",
      });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(400).json({
        success: false,
        message: "lat and lng must be valid numbers.",
      });
    }

    const ppd = Number(pricePerDay);
    const ppk = Number(pricePerKm);
    if (Number.isNaN(ppd) || ppd < 0 || Number.isNaN(ppk) || ppk < 0) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(400).json({
        success: false,
        message: "pricePerDay and pricePerKm must be valid non-negative numbers.",
      });
    }

    // 1) Create vehicle first WITHOUT photos (so we can get _id)
    const vehicle = await Vehicle.create({
      ownerId,
      title: title.trim(),
      description: description || "",
      numberPlate: numberPlate.trim(),
      model: model.trim(),
      vehicleType,
      year: Number(year),
      fuelType,
      transmission,
      pricePerDay: ppd,
      pricePerKm: ppk,
      photos: [],
      location: {
        address: address || "",
        geo: {
          type: "Point",
          coordinates: [lngNum, latNum],
        },
      },
    });

    // 2) Move uploaded files from temp folder -> uploads/<vehicleId>/
    const vehicleId = vehicle._id.toString();

    const uploadRoot = path.join(process.cwd(), "uploads");
    const destDir = path.join(uploadRoot, vehicleId);

    // Create uploads and vehicleId folder
    fs.mkdirSync(destDir, { recursive: true });

    const photos = [];

    for (const f of req.files) {
      const oldPath = f.path;
      const newPath = path.join(destDir, f.filename);

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

    if (vehicle?._id) {
      const vehicleId = vehicle._id.toString();
      const destDir = path.join(process.cwd(), "uploads", vehicleId);
      removeDirSafe(destDir);

      try {
        await Vehicle.findByIdAndDelete(vehicle._id);
      } catch (_) {}
    }

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



// DELETE VEHICLE LISTING
export const deleteVehicleListing = async (req, res) => {
  try {
    const ownerId = req.user?.userid;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vehicleId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle ID." });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    if (vehicle.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden. You do not own this vehicle." });
    }

    await Vehicle.findByIdAndDelete(vehicleId);

    const folderPath = path.join(process.cwd(), "uploads", vehicleId);
    removeDirSafe(folderPath);

    return res.status(200).json({ 
      success: true, 
      message: "Vehicle deleted successfully.",
      deletedId: vehicleId
    });
  } catch (error) {
    console.log("DELETE VEHICLE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error",
    });
  }
};



// GET SINGLE VEHICLE LISTING
export const getSingleVehicleListing = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle ID." });
    }

    const vehicle = await Vehicle.findById(vehicleId)
      .populate("ownerId", "name email phoneNumber")
      .lean();

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    return res.status(200).json({ 
      success: true, 
      vehicle 
    });
  } catch (error) {
    console.log("GET SINGLE VEHICLE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error",
    });
  }
};



// GET MY ALL VEHICLE LISTINGS
export const getMyVehicleListings = async (req, res) => {
  try {
    const ownerId = req.user?.userid;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vehicles = await Vehicle.find({ ownerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ 
      success: true, 
      count: vehicles.length,
      vehicles 
    });
  } catch (error) {
    console.log("GET MY VEHICLE LISTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error",
    });
  }
};



// UPDATE VEHICLE LISTING
export const updateVehicleListing = async (req,res) => {
  let tempDir = req._uploadTempDir;

  try {
    const ownerId = req.user?.userid;
    if (!ownerId) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vehicleId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(400).json({ success: false, message: "Invalid vehicle ID." });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    if (vehicle.ownerId.toString() !== ownerId.toString()) {
      if (tempDir) removeDirSafe(tempDir);
      return res.status(403).json({ success: false, message: "Forbidden. You do not own this vehicle." });
    }

    const {
      title,
      description,
      numberPlate,
      model,
      vehicleType,
      year,
      fuelType,
      transmission,
      pricePerDay,
      pricePerKm,
      address,
      lat,
      lng,
      replacePhotos
    } = req.body;

    if (title !== undefined) vehicle.title = String(title).trim();
    if (description !== undefined) vehicle.description = String(description);
    if (numberPlate !== undefined) vehicle.numberPlate = String(numberPlate).trim();
    if (model !== undefined) vehicle.model = String(model).trim();
    if (vehicleType !== undefined) vehicle.vehicleType = String(vehicleType).trim();

    if (year !== undefined) {
      const y = Number(year);
      if (Number.isNaN(y)) {
        if (tempDir) removeDirSafe(tempDir);
        return res.status(400).json({ success: false, message: "Year must be a valid number." });
      }
      vehicle.year = y;
    }

    if (fuelType !== undefined) vehicle.fuelType = fuelType;
    if (transmission !== undefined) vehicle.transmission = transmission;

    if (pricePerDay !== undefined) {
      const ppd = Number(pricePerDay);
      if (Number.isNaN(ppd) || ppd < 0) {
        if (tempDir) removeDirSafe(tempDir);
        return res.status(400).json({ success: false, message: "pricePerDay must be a valid non-negative number." });
      }
      vehicle.pricePerDay = ppd;
    }

    if (pricePerKm !== undefined) {
      const ppk = Number(pricePerKm);
      if (Number.isNaN(ppk) || ppk < 0) {
        if (tempDir) removeDirSafe(tempDir);
        return res.status(400).json({ success: false, message: "pricePerKm must be a valid non-negative number." });
      }
      vehicle.pricePerKm = ppk;
    }

    const latProvided = lat !== undefined && lat !== "";
    const lngProvided = lng !== undefined && lng !== "";
    if (latProvided || lngProvided) {
      if (!(latProvided && lngProvided)) {
        if (tempDir) removeDirSafe(tempDir);
        return res.status(400).json({ success: false, message: "Provide both lat and lng together." });
      }

      const latNum = Number(lat);
      const lngNum = Number(lng);
      if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
        if (tempDir) removeDirSafe(tempDir);
        return res.status(400).json({ success: false, message: "lat and lng must be valid numbers." });
      }

      vehicle.location = vehicle.location || {};
      vehicle.location.address = address !== undefined ? String(address) : (vehicle.location.address || "");

      vehicle.location.geo = {
        type: "Point",
        coordinates: [lngNum, latNum], // must be [lng, lat]
      };
    } else if (address !== undefined) {
      vehicle.location = vehicle.location || {};
      vehicle.location.address = String(address);
      // keep geo unchanged
    }

    // --- photos update (optional) ---
    const wantsReplace = String(replacePhotos).toLowerCase() === "true";

    if (req.files && req.files.length > 0) {
      const vid = vehicle._id.toString();
      const destDir = path.join(process.cwd(), "uploads", vid);

      if (wantsReplace) {
        // delete vehicle upload folder + recreate (simple replace)
        removeDirSafe(destDir);
        fs.mkdirSync(destDir, { recursive: true });
        vehicle.photos = [];
      } else {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const newPhotos = [];
      for (const f of req.files) {
        const oldPath = f.path;
        const newPath = path.join(destDir, f.filename);
        fs.renameSync(oldPath, newPath);

        newPhotos.push({
          url: `/uploads/${vid}/${f.filename}`,
          key: f.filename,
        });
      }

      vehicle.photos = wantsReplace ? newPhotos : [...vehicle.photos, ...newPhotos];
    }

    await vehicle.save(); // runs schema enums/validations

    if (tempDir) removeDirSafe(tempDir);

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
      vehicle,
    });
  } catch (error) {
    console.log("UPDATE VEHICLE ERROR:", error);
    if (tempDir) removeDirSafe(tempDir);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate number plate for this owner.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error",
    });
  }
};