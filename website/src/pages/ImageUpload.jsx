import React, { useState } from "react";
import { uploadToCloudinary } from "../components/cloudinaryConfig/uploadToCloudinary";

function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const result = await uploadToCloudinary(file, "my-folder");

    if (result.success) {
      setImageUrl(result.url);
      console.log("Upload successful:", result.url);
      // Yahan result.url ko database me save kar sakte ho
    } else {
      alert("Upload failed: " + result.error);
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        accept="image/*"
        disabled={uploading}
      />

      {uploading && <p>Uploading...</p>}

      {imageUrl && (
        <div>
          <p>Upload successful!</p>
          <img src={imageUrl} alt="Uploaded" width="200" />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
