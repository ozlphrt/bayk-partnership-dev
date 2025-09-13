import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchPartnerProfile, fetchAnalytics } from '../store/slices/partnerSlice';

const PartnerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, analytics, isLoading, error } = useSelector(
    (state: RootState) => state.partner
  );

  useEffect(() => {
    dispatch(fetchPartnerProfile());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading && !profile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">No partner profile found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          {profile.businessName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            label={profile.businessType}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={profile.isVerified ? 'Verified' : 'Pending Verification'}
            color={profile.isVerified ? 'success' : 'warning'}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          {profile.description || 'Partner dashboard for managing member discounts'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScannerIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Verifications</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {analytics?.totalVerifications || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total member verifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Discounts Applied</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {analytics?.totalDiscountsApplied || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total discounts given
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Savings</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(analytics?.totalSavings || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Savings provided to members
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Partnership</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {formatDate(profile.partnershipDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Partnership start date
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ScannerIcon />}
                sx={{ py: 1.5 }}
              >
                Scan QR Code
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                sx={{ py: 1.5 }}
              >
                View Analytics
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ py: 1.5 }}
              >
                Manage Promotions
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ py: 1.5 }}
              >
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Business Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">
                  {profile.address}
                </Typography>
                <Typography variant="body1">
                  {profile.city}, {profile.state} {profile.zipCode}
                </Typography>
              </Box>
              
              {profile.phone && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {profile.phone}
                  </Typography>
                </Box>
              )}
              
              {profile.website && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Website
                  </Typography>
                  <Typography variant="body1" component="a" href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </Typography>
                </Box>
              )}
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Contact Email
                </Typography>
                <Typography variant="body1">
                  {profile.contactEmail}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recent Activity
              </Typography>
              {analytics?.monthlyStats && analytics.monthlyStats.length > 0 ? (
                <Box>
                  {analytics.monthlyStats.slice(0, 5).map((stat, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body2">
                          {stat.month}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.verifications} verifications
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="success.main">
                          {stat.discounts} discounts
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(stat.savings)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No recent activity data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PartnerDashboard;
