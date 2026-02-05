import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';

const TwoFactorAuthModal = ({
  open,
  onClose,
  qrCode,
  manualEntryKey,
  otp,
  setOtp,
  handleVerify2FA,
  loading,
  handleCopySecret,
  copied,
}) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* OUTER BOX — keeps border radius intact */}
      <Box
        sx={{
          maxWidth: 500,
          width: '90%',
          backgroundColor: 'white',
          borderRadius: 2,
          overflow: 'hidden', // ✅ IMPORTANT
        }}
      >
        {/* INNER BOX — scrollable */}
        <Box
          sx={{
            p: 4,
            maxHeight: '80vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '4px',
            },
          }}
        >
          <Typography variant="h6" fontWeight="bold" align="center">
            Set up Two-Factor Authentication
          </Typography>

          <Typography
            align="center"
            mb={2}
            variant="body2"
            color="text.secondary"
          >
            Scan the QR code or enter the key manually in your authenticator app
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            Download Google Authenticator or Microsoft Authenticator from your app
            store
          </Alert>

          {qrCode && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <Typography variant="subtitle2" gutterBottom>
                Scan QR Code:
              </Typography>
              <img
                src={qrCode}
                alt="2FA QR Code"
                style={{
                  width: 200,
                  height: 200,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '8px',
                  backgroundColor: 'white',
                }}
              />
            </Box>
          )}

          {manualEntryKey && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Or enter this key manually:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: '#f5f5f5',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    flexGrow: 1,
                    fontSize: '0.9rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {manualEntryKey}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopySecret}
                  color={copied ? 'success' : 'default'}
                >
                  {copied ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <ContentCopy fontSize="small" />
                  )}
                </IconButton>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
              >
                Click the copy icon to copy the secret key
              </Typography>
            </Box>
          )}

          <TextField
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ''))
            }
            placeholder="Enter 6-digit code from app"
            fullWidth
            size="small"
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            sx={{ mb: 2 }}
            disabled={loading}
            autoFocus
          />

          <Button
            onClick={handleVerify2FA}
            variant="contained"
            fullWidth
            disabled={otp.length !== 6 || loading}
            sx={{
              bgcolor: '#173A5E',
              '&:hover': { bgcolor: '#1E4C80' },
              borderRadius: '10px',
              py: 1.2,
            }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              'Verify & Continue'
            )}
          </Button>

          <Button
            onClick={onClose}
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TwoFactorAuthModal;