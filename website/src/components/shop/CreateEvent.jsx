import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import {
  createEvent,
  clearError,
  clearSuccess,
} from "../../redux/events/eventSlice";
import { uploadToCloudinary } from "../cloudinaryConfig/uploadToCloudinary";

const CreateEvent = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error, message, loading } = useSelector(
    (state) => state.event
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form states
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [start_Date, setStart_Date] = useState(null);
  const [Finish_Date, setFinish_Date] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Handle start date change
  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    setStart_Date(startDate);
    setFinish_Date(null);
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const endDate = new Date(e.target.value);
    setFinish_Date(endDate);
  };

  const today = new Date().toISOString().slice(0, 10);

  const minEndDate = start_Date
    ? new Date(start_Date.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : "";

  // Handle success/error from Redux
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(message || "Event created successfully!");
      dispatch(clearSuccess());
      navigate("/dashboard-events");
    }
  }, [error, success, message, dispatch, navigate]);

  // Handle image selection
  const handleImageChange = (e) => {
    e.preventDefault();
    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  // Remove image from preview
  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !description || !category || !discountPrice || !stock) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!start_Date || !Finish_Date) {
      toast.error("Please select event start and end dates");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      setUploading(true);

      // Upload all images to Cloudinary
      const uploadPromises = images.map((image) =>
        uploadToCloudinary(image, "events")
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Check if any upload failed
      const failedUploads = uploadResults.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        toast.error("Some images failed to upload. Please try again.");
        setUploading(false);
        return;
      }

      // Extract image URLs
      const imageUrls = uploadResults.map((result) => result.url);

      // Prepare event data (matching Event model)
      const eventData = {
        name,
        description,
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean), // Convert to array
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discountPrice: Number(discountPrice),
        stock: Number(stock),
        start_Date: start_Date.toISOString(),
        Finish_Date: Finish_Date.toISOString(),
        images: imageUrls,
        seller: seller._id, // Seller reference
      };

      // Dispatch create event action
      // console.log("console this events", eventData);
      dispatch(createEvent(eventData));
      setUploading(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
      setUploading(false);
    }
  };

  const isSubmitting = loading || uploading;

  return (
    <div className="w-[90%] min-[800px]:w-[50%] bg-white shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
      <h5 className="text-[30px] font-Poppins text-center">Create Event</h5>

      <form onSubmit={handleSubmit}>
        <br />

        {/* Event Name */}
        <div>
          <label className="pb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your event product name..."
            required
          />
        </div>
        <br />

        {/* Description */}
        <div>
          <label className="pb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            cols="30"
            required
            rows="8"
            type="text"
            name="description"
            value={description}
            className="mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your event product description..."
          ></textarea>
        </div>
        <br />

        {/* Category */}
        <div>
          <label className="pb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full mt-2 border h-[35px] rounded-[5px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Choose a category</option>
            {categoriesData &&
              categoriesData.map((i) => (
                <option value={i.title} key={i.title}>
                  {i.title}
                </option>
              ))}
          </select>
        </div>
        <br />

        {/* Tags */}
        <div>
          <label className="pb-2">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={tags}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. sale, limited, special offer"
          />
        </div>
        <br />

        {/* Original Price */}
        <div>
          <label className="pb-2">Original Price</label>
          <input
            type="number"
            name="originalPrice"
            value={originalPrice}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Enter original price..."
            min="0"
          />
        </div>
        <br />

        {/* Discount Price */}
        <div>
          <label className="pb-2">
            Price (With Discount) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="discountPrice"
            value={discountPrice}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder="Enter discounted price..."
            required
            min="0"
          />
        </div>
        <br />

        {/* Stock */}
        <div>
          <label className="pb-2">
            Product Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="stock"
            value={stock}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter stock quantity..."
            required
            min="0"
          />
        </div>
        <br />

        {/* Start Date */}
        <div>
          <label className="pb-2">
            Event Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="start-date"
            value={start_Date ? start_Date.toISOString().slice(0, 10) : ""}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={handleStartDateChange}
            min={today}
            required
          />
        </div>
        <br />

        {/* End Date */}
        <div>
          <label className="pb-2">
            Event End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="end-date"
            value={Finish_Date ? Finish_Date.toISOString().slice(0, 10) : ""}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={handleEndDateChange}
            min={minEndDate}
            required
            disabled={!start_Date}
          />
        </div>
        <br />

        {/* Upload Images */}
        <div>
          <label className="pb-2">
            Upload Images <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="upload"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          <div className="w-full flex items-center flex-wrap">
            <label htmlFor="upload">
              <AiOutlinePlusCircle
                size={30}
                className="mt-3 cursor-pointer"
                color="#555"
              />
            </label>
            {images &&
              images.map((img, index) => (
                <div key={index} className="relative m-2">
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="h-[120px] w-[120px] object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
        <br />

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 cursor-pointer appearance-none text-center block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {uploading
              ? "Uploading Images..."
              : loading
              ? "Creating Event..."
              : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
