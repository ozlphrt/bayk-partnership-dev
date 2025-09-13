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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchAdminProfile, fetchSystemStats, fetchMembers, fetchPartners } from '../store/slices/adminSlice';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, stats, members, partners, isLoading, error } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    dispatch(fetchAdminProfile());
    dispatch(fetchSystemStats());
    dispatch(fetchMembers());
    dispatch(fetchPartners());
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

  const getVerificationStatusColor = (isVerified: boolean) => {
    return isVerified ? 'success' : 'warning';
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
        <Alert severity="warning">No admin profile found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            label={profile.adminType}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          System overview and management tools
        </Typography>
      </Box>

      {/* System Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Members</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {stats?.totalMembers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.activeMembers || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Partners</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {stats?.totalPartners || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.activePartners || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Transactions</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {stats?.totalTransactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Savings</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(stats?.totalSavings || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Provided to members
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
                startIcon={<AddIcon />}
                sx={{ py: 1.5 }}
              >
                Add Partner
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PeopleIcon />}
                sx={{ py: 1.5 }}
              >
                Manage Members
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BusinessIcon />}
                sx={{ py: 1.5 }}
              >
                Manage Partners
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                sx={{ py: 1.5 }}
              >
                View Analytics
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Grid container spacing={3}>
        {/* Members Table */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Recent Members
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                >
                  Manage
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Membership</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.slice(0, 5).map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {member.firstName} {member.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.membershipType}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.duesStatus}
                            color={getDuesStatusColor(member.duesStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(member.joinedDate)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Partners Table */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Recent Partners
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                >
                  Manage
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Business</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partners.slice(0, 5).map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {partner.businessName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {partner.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={partner.businessType}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={partner.isVerified ? 'Verified' : 'Pending'}
                            color={getVerificationStatusColor(partner.isVerified)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(partner.partnershipDate)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
