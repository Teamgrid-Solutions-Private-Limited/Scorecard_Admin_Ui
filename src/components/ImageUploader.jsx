import React, { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ImageUploader = () => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={3}>
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
      >
        Upload Image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="subtitle1">Preview</Typography>
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #ddd",
            }}
          />
        ) : (
          <Typography color="gray">No Image Selected</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ImageUploader;
