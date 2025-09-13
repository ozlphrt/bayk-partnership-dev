import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  ArrowBack as ArrowBackIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { verifyMember, applyDiscount } from '../store/slices/partnerSlice';
import { useAuth } from '../hooks/useAuth';

const QRCodeScanner: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading, error } = useSelector((state: RootState) => state.partner);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    originalAmount: '',
    description: '',
  });

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleFlash = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'torch' in videoTrack) {
        videoTrack.torch = !flashEnabled;
        setFlashEnabled(!flashEnabled);
      }
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Simple QR code detection (in a real app, you'd use a proper QR code library)
    // For now, we'll simulate detection
    setTimeout(() => {
      // Simulate QR code detection
      const mockQRCode = 'MEMBER:member123:AGREEMENT:agreement456:EXPIRES:2024-12-31';
      handleQRCodeDetected(mockQRCode);
    }, 1000);
  };

  const handleQRCodeDetected = async (qrCodeData: string) => {
    try {
      const result = await dispatch(verifyMember(qrCodeData)).unwrap();
      setVerificationResult(result);
      
      if (result.isValid) {
        setDiscountDialogOpen(true);
        stopCamera();
      }
    } catch (error) {
      console.error('Error verifying member:', error);
      setVerificationResult({ isValid: false, error: 'Verification failed' });
    }
  };

  const handleApplyDiscount = async () => {
    if (!verificationResult?.memberId || !verificationResult?.agreementId) return;

    try {
      await dispatch(applyDiscount({
        memberId: verificationResult.memberId,
        agreementId: verificationResult.agreementId,
        originalAmount: parseFloat(discountForm.originalAmount),
        description: discountForm.description,
      })).unwrap();

      // Reset form and close dialog
      setDiscountForm({ originalAmount: '', description: '' });
      setDiscountDialogOpen(false);
      setVerificationResult(null);
      
      // Navigate back to dashboard
      navigate('/partner');
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };

  const handleManualInput = (qrCodeData: string) => {
    handleQRCodeDetected(qrCodeData);
  };

  // Start scanning when component mounts
  useEffect(() => {
    startCamera();
  }, []);

  // Scan for QR codes periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      interval = setInterval(scanQRCode, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isScanning]);

  if (hasPermission === false) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <QrCodeScannerIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Camera Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please allow camera access to scan QR codes, or use manual input below.
            </Typography>
            <Button
              variant="contained"
              onClick={startCamera}
              sx={{ mb: 2 }}
            >
              Try Again
            </Button>
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Enter QR Code Data Manually"
                placeholder="Paste QR code data here"
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    handleManualInput(e.target.value.trim());
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/partner')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          QR Code Scanner
        </Typography>
      </Box>

      {/* Scanner */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', backgroundColor: 'black' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
              }}
            />
            
            {/* Scanner overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                border: '2px solid #1976d2',
                borderRadius: 2,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  right: '-2px',
                  bottom: '-2px',
                  border: '2px solid rgba(25, 118, 210, 0.3)',
                  borderRadius: 2,
                  animation: 'pulse 2s infinite',
                },
              }}
            />
            
            {/* Controls */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
              }}
            >
              <IconButton
                onClick={toggleFlash}
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                {flashEnabled ? <FlashOffIcon /> : <FlashOnIcon />}
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
              Position the QR code within the frame to scan
            </Typography>
            
            {verificationResult && (
              <Alert
                severity={verificationResult.isValid ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                {verificationResult.isValid ? (
                  <Box>
                    <Typography variant="body2">
                      Valid member: {verificationResult.memberName}
                    </Typography>
                    <Typography variant="body2">
                      Discount: {verificationResult.discountType} - {verificationResult.discountValue}%
                    </Typography>
                  </Box>
                ) : (
                  verificationResult.error || 'Invalid QR code'
                )}
              </Alert>
            )}
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setVerificationResult(null);
                if (isScanning) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
            >
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Manual Input */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Manual Input
          </Typography>
          <TextField
            fullWidth
            label="QR Code Data"
            placeholder="Enter QR code data manually"
            multiline
            rows={3}
            onChange={(e) => {
              if (e.target.value.trim()) {
                handleManualInput(e.target.value.trim());
              }
            }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              const input = document.querySelector('input[placeholder="Enter QR code data manually"]') as HTMLInputElement;
              if (input?.value.trim()) {
                handleManualInput(input.value.trim());
              }
            }}
          >
            Verify Member
          </Button>
        </CardContent>
      </Card>

      {/* Hidden canvas for QR code detection */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Discount Application Dialog */}
      <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Discount</DialogTitle>
        <DialogContent>
          {verificationResult && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Member: {verificationResult.memberName}
                </Typography>
                <Typography variant="body2">
                  Discount: {verificationResult.discountType} - {verificationResult.discountValue}%
                </Typography>
              </Alert>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Original Amount"
            type="number"
            value={discountForm.originalAmount}
            onChange={(e) => setDiscountForm({ ...discountForm, originalAmount: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Description (Optional)"
            multiline
            rows={3}
            value={discountForm.description}
            onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyDiscount}
            disabled={!discountForm.originalAmount}
          >
            Apply Discount
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QRCodeScanner;