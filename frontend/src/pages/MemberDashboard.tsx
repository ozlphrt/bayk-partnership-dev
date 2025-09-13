import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  LocalOffer as DiscountIcon,
  History as HistoryIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchMemberProfile, fetchPartners, fetchUsageHistory } from '../store/slices/memberSlice';

const MemberDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, partners, usageHistory, isLoading, error } = useSelector(
    (state: RootState) => state.member
  );

  useEffect(() => {
    dispatch(fetchMemberProfile());
    dispatch(fetchPartners());
    dispatch(fetchUsageHistory());
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

  const getDuesStatusColor = (status: string) => {
    switch (status) {
      case 'CURRENT':
        return 'success';
      case 'OVERDUE':
        return 'error';
      case 'SUSPENDED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getMembershipTypeColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'primary';
      case 'PREMIUM':
        return 'secondary';
      case 'LIFETIME':
        return 'success';
      default:
        return 'default';
    }
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
        <Alert severity="warning">No member profile found</Alert>
      </Container>
    );
  }

  const totalSavings = usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0);
  const activePartners = partners.filter(partner => partner.isActive && partner.isVerified).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome back, {profile.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your membership and explore partner benefits
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QrCodeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Membership</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {profile.membershipId}
              </Typography>
              <Chip
                label={profile.membershipType}
                color={getMembershipTypeColor(profile.membershipType)}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DiscountIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Savings</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(totalSavings)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {usageHistory.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Partners</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {activePartners}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available discounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Dues Status</Typography>
              </Box>
              <Chip
                label={profile.duesStatus}
                color={getDuesStatusColor(profile.duesStatus)}
                sx={{ mb: 1 }}
              />
              {profile.duesAmount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(profile.duesAmount)} due
                  {profile.duesDueDate && ` by ${formatDate(profile.duesDueDate)}`}
                </Typography>
              )}
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
                startIcon={<QrCodeIcon />}
                sx={{ py: 1.5 }}
              >
                Show QR Code
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BusinessIcon />}
                sx={{ py: 1.5 }}
              >
                Browse Partners
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                sx={{ py: 1.5 }}
              >
                View History
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

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recent Usage
              </Typography>
              {usageHistory.length === 0 ? (
                <Typography color="text.secondary">
                  No recent usage found
                </Typography>
              ) : (
                <Box>
                  {usageHistory.slice(0, 5).map((usage) => (
                    <Box
                      key={usage.id}
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
                          {formatDate(usage.usedAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {usage.description || 'Discount applied'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="success.main">
                        -{formatCurrency(usage.discountAmount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Featured Partners
              </Typography>
              {partners.length === 0 ? (
                <Typography color="text.secondary">
                  No partners available
                </Typography>
              ) : (
                <Box>
                  {partners.slice(0, 5).map((partner) => (
                    <Box
                      key={partner.id}
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
                          {partner.businessName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partner.businessType} • {partner.city}, {partner.state}
                        </Typography>
                      </Box>
                      <Chip
                        label={partner.agreements.length > 0 ? 'Active' : 'Pending'}
                        color={partner.agreements.length > 0 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MemberDashboard;
