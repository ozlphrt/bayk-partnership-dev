import React, { useState, useRef, useEffect } from 'react';
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
  Chip,
  Grid,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { verifyMember, applyDiscount } from '../store/slices/partnerSlice';

const QRCodeScanner: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.partner);

  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [discountData, setDiscountData] = useState({
    originalAmount: '',
    description: '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setScannedData(null);
        setVerificationResult(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to manual input for development
      setScannedData('demo-qr-code-123');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeDetected = async (qrCode: string) => {
    setScannedData(qrCode);
    stopScanning();
    
    try {
      const result = await dispatch(verifyMember(qrCode));
      if (verifyMember.fulfilled.match(result)) {
        setVerificationResult(result.payload);
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleApplyDiscount = async () => {
    if (!verificationResult || !discountData.originalAmount) return;

    try {
      const discountPayload = {
        memberId: verificationResult.memberId,
        agreementId: verificationResult.agreementId,
        originalAmount: parseFloat(discountData.originalAmount),
        description: discountData.description,
      };

      const result = await dispatch(applyDiscount(discountPayload));
      if (applyDiscount.fulfilled.match(result)) {
        // Reset form after successful discount application
        setVerificationResult(null);
        setScannedData(null);
        setDiscountData({ originalAmount: '', description: '' });
      }
    } catch (error) {
      console.error('Discount application error:', error);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setVerificationResult(null);
    setDiscountData({ originalAmount: '', description: '' });
    stopScanning();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          QR Code Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Scan member QR codes to verify membership and apply discounts
        </Typography>
      </Box>

      {/* Scanner Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Member Verification
          </Typography>

          {!isScanning && !scannedData && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ScannerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Click the button below to start scanning member QR codes
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<ScannerIcon />}
                onClick={startScanning}
                disabled={isLoading}
                sx={{ py: 1.5, px: 4 }}
              >
                Start Scanning
              </Button>
            </Box>
          )}

          {isScanning && (
            <Box sx={{ textAlign: 'center' }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    borderRadius: '8px',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid #1976d2',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                  }}
                />
              </Paper>
              <Button
                variant="outlined"
                onClick={stopScanning}
                sx={{ mr: 2 }}
              >
                Stop Scanning
              </Button>
              <Button
                variant="text"
                onClick={() => setScannedData('demo-qr-code-123')}
                sx={{ color: 'text.secondary' }}
              >
                Use Demo Code
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CheckIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Member Verified Successfully
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Member Information
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {verificationResult.memberName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Membership ID: {verificationResult.membershipId}
                  </Typography>
                  <Chip
                    label={verificationResult.membershipType}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Available Discount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {verificationResult.discountType === 'PERCENTAGE' 
                      ? `${verificationResult.discountValue}% off`
                      : `$${verificationResult.discountValue} off`
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {verificationResult.description || 'Standard member discount'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Discount Application */}
      {verificationResult && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Apply Discount
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Original Amount ($)
                  </Typography>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountData.originalAmount}
                    onChange={(e) => setDiscountData(prev => ({
                      ...prev,
                      originalAmount: e.target.value
                    }))}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #555',
                      backgroundColor: 'rgba(30, 30, 30, 0.8)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Description (Optional)
                  </Typography>
                  <input
                    type="text"
                    value={discountData.description}
                    onChange={(e) => setDiscountData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="e.g., Restaurant meal, Hotel stay"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #555',
                      backgroundColor: 'rgba(30, 30, 30, 0.8)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            {discountData.originalAmount && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Discount Calculation:
                </Typography>
                <Typography variant="body1">
                  Original: ${parseFloat(discountData.originalAmount).toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  Discount: {verificationResult.discountType === 'PERCENTAGE' 
                    ? `${verificationResult.discountValue}%`
                    : `$${verificationResult.discountValue}`
                  }
                </Typography>
                <Typography variant="h6" color="success.main">
                  Final: ${(
                    parseFloat(discountData.originalAmount) - 
                    (verificationResult.discountType === 'PERCENTAGE' 
                      ? parseFloat(discountData.originalAmount) * (verificationResult.discountValue / 100)
                      : verificationResult.discountValue
                    )
                  ).toFixed(2)}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleApplyDiscount}
                disabled={!discountData.originalAmount || isLoading}
                sx={{ py: 1.5, px: 4 }}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Apply Discount'}
              </Button>
              <Button
                variant="outlined"
                onClick={resetScanner}
                startIcon={<RefreshIcon />}
              >
                Scan Another
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default QRCodeScanner;
