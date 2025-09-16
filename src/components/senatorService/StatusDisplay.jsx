import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function StatusDisplay({ userRole, formData, statusData, localChanges, editedFields, houseTermData }) {
  if (!userRole || !formData?.publishStatus || !statusData) return null;
  if (formData.publishStatus === "published" && localChanges.length === 0) return null;

  return (
    <Box
      sx={{
        width: "97%",
        p: 2,
        backgroundColor: statusData.backgroundColor,
        borderLeft: `4px solid ${statusData.borderColor}`,
        borderRadius: "0 8px 8px 0",
        boxShadow: 1,
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: "50%",
            backgroundColor: `rgba(${formData.publishStatus === "draft"
              ? "66, 165, 245"
              : formData.publishStatus === "under review"
              ? "230, 81, 0"
              : formData.publishStatus === "published"
              ? "76, 175, 80"
              : "244, 67, 54"}, 0.2)`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {statusData.icon && React.cloneElement(statusData.icon, { sx: { color: statusData.iconColor } })}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ color: statusData.titleColor, display: "flex", alignItems: "center", gap: 1 }}>
              {statusData.title}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


