import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { generateQRCode, regenerateQRCode } from '../store/slices/memberSlice';

interface QRCodeDisplayProps {
  qrCodeData?: string;
  onRefresh?: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeData, onRefresh }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isLoading, error } = useSelector((state: RootState) => state.member);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQRCode = qrCodeData || profile?.qrCode;

  useEffect(() => {
    if (currentQRCode) {
      generateQRCodeImage(currentQRCode);
    }
  }, [currentQRCode]);

  const generateQRCodeImage = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
  };

  const handleRefresh = async () => {
    setIsGenerating(true);
    try {
      await dispatch(regenerateQRCode()).unwrap();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error refreshing QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `sailclub-qr-${profile?.membershipId || 'code'}.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `sailclub-qr-${profile?.membershipId || 'code'}.png`, {
          type: 'image/png',
        });
        
        await navigator.share({
          title: 'SailClub Member QR Code',
          text: 'My SailClub membership QR code',
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(currentQRCode || '');
      }
    } else if (navigator.clipboard) {
      // Fallback to copy QR code data to clipboard
      navigator.clipboard.writeText(currentQRCode || '');
    }
  };

  const isExpired = profile?.qrCodeExpiry ? new Date(profile.qrCodeExpiry) < new Date() : false;

  if (isLoading && !currentQRCode) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading QR Code...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />}
            fullWidth
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQRCode) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <QrCodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No QR Code Available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate your membership QR code to access partner discounts
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <QrCodeIcon />}
            fullWidth
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Membership QR Code
          </Typography>
          <Box>
            <Tooltip title="Refresh QR Code">
              <IconButton
                onClick={handleRefresh}
                disabled={isGenerating}
                size="small"
              >
                {isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Download QR Code">
              <IconButton onClick={handleDownload} size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share QR Code">
              <IconButton onClick={handleShare} size="small">
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {isExpired && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This QR code has expired. Please refresh to generate a new one.
          </Alert>
        )}

        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 2,
            display: 'inline-block',
            mb: 2,
          }}
        >
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="SailClub Membership QR Code"
              style={{ width: 256, height: 256 }}
            />
          ) : (
            <Box sx={{ width: 256, height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Membership ID: {profile?.membershipId}
        </Typography>
        
        {profile?.qrCodeExpiry && (
          <Typography variant="caption" color="text.secondary">
            Expires: {new Date(profile.qrCodeExpiry).toLocaleDateString()}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>
          Show this QR code to partners to receive your member discounts
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
