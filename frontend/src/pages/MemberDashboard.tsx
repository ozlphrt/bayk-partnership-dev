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
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Store as StoreIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { fetchMemberProfile, fetchPartners, fetchUsageHistory, fetchMemberStats } from '../store/slices/memberSlice';
import { useAuth } from '../hooks/useAuth';
import QRCodeDisplay from '../components/QRCodeDisplay';

const MemberDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, partners, usageHistory, stats, isLoading, error } = useSelector(
    (state: RootState) => state.member
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchMemberProfile()).unwrap(),
          dispatch(fetchPartners()).unwrap(),
          dispatch(fetchUsageHistory()).unwrap(),
          dispatch(fetchMemberStats()).unwrap(),
        ]);
      } catch (error) {
        console.error('Error loading member data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  const handleLogout = async () => {
    await logout();
  };

  const getMembershipTypeColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'error';
      case 'PREMIUM':
        return 'warning';
      case 'LIFETIME':
        return 'success';
      default:
        return 'primary';
    }
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
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your membership and explore partner benefits
          </Typography>
        </Box>
        <IconButton onClick={handleLogout} color="inherit">
          <LogoutIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {profile?.user.firstName} {profile?.user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile?.user.email}
                  </Typography>
                </Box>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Membership ID"
                    secondary={profile?.membershipId}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Membership Type"
                    secondary={
                      <Chip
                        label={profile?.membershipType}
                        color={getMembershipTypeColor(profile?.membershipType || '')}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dues Status"
                    secondary={
                      <Chip
                        label={profile?.duesStatus}
                        color={getDuesStatusColor(profile?.duesStatus || '')}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                {profile?.duesAmount > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <AccountBalanceIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dues Amount"
                      secondary={`$${profile.duesAmount.toFixed(2)}`}
                    />
                  </ListItem>
                )}
                {profile?.user.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={profile.user.phone}
                    />
                  </ListItem>
                )}
                {profile?.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={profile.location}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* QR Code */}
        <Grid item xs={12} md={4}>
          <QRCodeDisplay />
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Statistics
              </Typography>
              {stats ? (
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Usage"
                      secondary={`${stats.totalUsage} visits`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SavingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Savings"
                      secondary={`$${stats.totalSavings.toFixed(2)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StoreIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Unique Partners"
                      secondary={`${stats.uniquePartners} businesses`}
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

        {/* Recent Usage History */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Usage
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/member/partners')}
                >
                  View All
                </Button>
              </Box>
              {usageHistory.length > 0 ? (
                <List>
                  {usageHistory.slice(0, 5).map((usage, index) => (
                    <React.Fragment key={usage.id}>
                      <ListItem>
                        <ListItemIcon>
                          <StoreIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={usage.partner.businessName}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {usage.partner.businessType} • {usage.partner.city}, {usage.partner.state}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Saved ${usage.discountAmount.toFixed(2)} • {new Date(usage.usedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < usageHistory.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No usage history yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start using your membership to see your savings here
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Available Partners */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Available Partners
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/member/partners')}
                >
                  View All
                </Button>
              </Box>
              {partners.length > 0 ? (
                <List>
                  {partners.slice(0, 5).map((partner, index) => (
                    <React.Fragment key={partner.id}>
                      <ListItem>
                        <ListItemIcon>
                          <StoreIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={partner.businessName}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {partner.businessType} • {partner.city}, {partner.state}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {partner.agreements.length} active agreement{partner.agreements.length !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < partners.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <StoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No partners available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for new partner offers
                  </Typography>
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