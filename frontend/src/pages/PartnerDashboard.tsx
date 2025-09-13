import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  Store as StoreIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { fetchPartnerProfile, fetchAnalytics, fetchTransactions, verifyMember, applyDiscount } from '../store/slices/partnerSlice';
import { useAuth } from '../hooks/useAuth';

const PartnerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, analytics, transactions, isLoading, error } = useSelector(
    (state: RootState) => state.partner
  );

  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    originalAmount: '',
    description: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchPartnerProfile()).unwrap(),
          dispatch(fetchAnalytics()).unwrap(),
          dispatch(fetchTransactions()).unwrap(),
        ]);
      } catch (error) {
        console.error('Error loading partner data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  const handleLogout = async () => {
    await logout();
  };

  const handleVerifyMember = async () => {
    if (!qrCodeInput.trim()) return;

    try {
      const result = await dispatch(verifyMember(qrCodeInput.trim())).unwrap();
      setVerificationResult(result);
      
      if (result.isValid) {
        setDiscountDialogOpen(true);
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
      setQrCodeInput('');

      // Refresh data
      dispatch(fetchAnalytics());
      dispatch(fetchTransactions());
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };

  const getBusinessTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'restaurant':
        return 'error';
      case 'hotel':
        return 'primary';
      case 'gym':
        return 'success';
      case 'equipment':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading && !profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Partner Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, {user?.firstName}! Manage your partnership with SailClub
          </Typography>
        </Box>
        <IconButton onClick={handleLogout} color="inherit">
          <LogoutIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Business Profile */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {profile?.businessName}
                  </Typography>
                  <Chip
                    label={profile?.businessType}
                    color={getBusinessTypeColor(profile?.businessType || '')}
                    size="small"
                  />
                </Box>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Contact Email"
                    secondary={profile?.contactEmail}
                  />
                </ListItem>
                {profile?.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={profile.phone}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={`${profile?.address}, ${profile?.city}, ${profile?.state} ${profile?.zipCode}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={profile?.isVerified ? 'Verified' : 'Pending Verification'}
                        color={profile?.isVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* QR Code Scanner */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <QrCodeScannerIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Member Verification
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Scan or enter member QR code to verify and apply discounts
              </Typography>
              
              <TextField
                fullWidth
                label="QR Code Data"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="Enter QR code data or scan"
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                onClick={handleVerifyMember}
                disabled={!qrCodeInput.trim()}
                fullWidth
                sx={{ mb: 2 }}
              >
                Verify Member
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/partner/scanner')}
                fullWidth
              >
                Open Scanner
              </Button>

              {verificationResult && (
                <Alert
                  severity={verificationResult.isValid ? 'success' : 'error'}
                  sx={{ mt: 2 }}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics (30 days)
              </Typography>
              {analytics ? (
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Verifications"
                      secondary={analytics.totalVerifications}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SavingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Discounts Applied"
                      secondary={analytics.totalDiscountsApplied}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SavingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Savings"
                      secondary={`$${analytics.totalSavings.toFixed(2)}`}
                    />
                  </ListItem>
                </List>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Transactions
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => dispatch(fetchTransactions())}
                >
                  Refresh
                </Button>
              </Box>
              {transactions.length > 0 ? (
                <List>
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${transaction.member.user.firstName} ${transaction.member.user.lastName}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {transaction.description || 'Discount applied'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Saved ${transaction.discountAmount.toFixed(2)} • {new Date(transaction.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < transactions.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No transactions yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start verifying members to see transactions here
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Partnership Agreements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Agreements
              </Typography>
              {profile?.agreements && profile.agreements.length > 0 ? (
                <List>
                  {profile.agreements.map((agreement, index) => (
                    <React.Fragment key={agreement.id}>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${agreement.discountType} - ${agreement.discountValue}%`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {agreement.description || 'Standard discount'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Valid until: {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString() : 'No expiry'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < profile.agreements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No active agreements
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact admin to set up partnership agreements
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default PartnerDashboard;