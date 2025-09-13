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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import {
  fetchAdminProfile,
  fetchSystemStats,
  fetchMembers,
  fetchPartners,
  fetchPartnershipAgreements,
  fetchSystemTransactions,
  updateMember,
  updatePartner,
  createPartnershipAgreement,
} from '../store/slices/adminSlice';
import { useAuth } from '../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, stats, members, partners, agreements, transactions, isLoading, error } = useSelector(
    (state: RootState) => state.admin
  );

  const [tabValue, setTabValue] = useState(0);
  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  const [agreementForm, setAgreementForm] = useState({
    partnerId: '',
    agreementType: 'STANDARD',
    discountType: 'PERCENTAGE',
    discountValue: '',
    description: '',
    terms: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAdminProfile()).unwrap(),
          dispatch(fetchSystemStats()).unwrap(),
          dispatch(fetchMembers()).unwrap(),
          dispatch(fetchPartners()).unwrap(),
          dispatch(fetchPartnershipAgreements()).unwrap(),
          dispatch(fetchSystemTransactions()).unwrap(),
        ]);
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  const handleLogout = async () => {
    await logout();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateAgreement = async () => {
    try {
      await dispatch(createPartnershipAgreement(agreementForm)).unwrap();
      setAgreementDialogOpen(false);
      setAgreementForm({
        partnerId: '',
        agreementType: 'STANDARD',
        discountType: 'PERCENTAGE',
        discountValue: '',
        description: '',
        terms: '',
        startDate: '',
        endDate: '',
      });
      dispatch(fetchPartnershipAgreements());
    } catch (error) {
      console.error('Error creating agreement:', error);
    }
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
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, {user?.firstName}! Manage the SailClub system
          </Typography>
        </Box>
        <IconButton onClick={handleLogout} color="inherit">
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* System Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats?.totalMembers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats?.totalPartners || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Partners
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats?.totalTransactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SavingsIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                ${stats?.totalSavings?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Savings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Members" />
            <Tab label="Partners" />
            <Tab label="Agreements" />
            <Tab label="Transactions" />
          </Tabs>
        </Box>

        {/* Members Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Members Management</Typography>
            <Button
              variant="outlined"
              onClick={() => dispatch(fetchMembers())}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Membership Type</TableCell>
                  <TableCell>Dues Status</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.user.firstName} {member.user.lastName}
                    </TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.membershipType}
                        color={getMembershipTypeColor(member.membershipType)}
                        size="small"
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
                      {new Date(member.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Partners Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Partners Management</Typography>
            <Button
              variant="outlined"
              onClick={() => dispatch(fetchPartners())}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business Name</TableCell>
                  <TableCell>Contact Email</TableCell>
                  <TableCell>Business Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>{partner.businessName}</TableCell>
                    <TableCell>{partner.user.email}</TableCell>
                    <TableCell>{partner.businessType}</TableCell>
                    <TableCell>{partner.city}, {partner.state}</TableCell>
                    <TableCell>
                      <Chip
                        label={partner.isVerified ? 'Verified' : 'Pending'}
                        color={partner.isVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Agreements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Partnership Agreements</Typography>
            <Button
              variant="contained"
              onClick={() => setAgreementDialogOpen(true)}
              startIcon={<AddIcon />}
            >
              Create Agreement
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Partner</TableCell>
                  <TableCell>Agreement Type</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agreements.map((agreement) => (
                  <TableRow key={agreement.id}>
                    <TableCell>{agreement.partnerId}</TableCell>
                    <TableCell>{agreement.agreementType}</TableCell>
                    <TableCell>
                      {agreement.discountType} - {agreement.discountValue}%
                    </TableCell>
                    <TableCell>
                      {new Date(agreement.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString() : 'No expiry'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={agreement.isActive ? 'Active' : 'Inactive'}
                        color={agreement.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Transactions Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">System Transactions</Typography>
            <Button
              variant="outlined"
              onClick={() => dispatch(fetchSystemTransactions())}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Partner</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Final Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.member.user.firstName} {transaction.member.user.lastName}
                    </TableCell>
                    <TableCell>{transaction.partner.businessName}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>${transaction.discountAmount.toFixed(2)}</TableCell>
                    <TableCell>${transaction.finalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Create Agreement Dialog */}
      <Dialog open={agreementDialogOpen} onClose={() => setAgreementDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Partnership Agreement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Partner</InputLabel>
                <Select
                  value={agreementForm.partnerId}
                  onChange={(e) => setAgreementForm({ ...agreementForm, partnerId: e.target.value })}
                  label="Partner"
                >
                  {partners.map((partner) => (
                    <MenuItem key={partner.id} value={partner.id}>
                      {partner.businessName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Agreement Type</InputLabel>
                <Select
                  value={agreementForm.agreementType}
                  onChange={(e) => setAgreementForm({ ...agreementForm, agreementType: e.target.value })}
                  label="Agreement Type"
                >
                  <MenuItem value="STANDARD">Standard</MenuItem>
                  <MenuItem value="PREMIUM">Premium</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={agreementForm.discountType}
                  onChange={(e) => setAgreementForm({ ...agreementForm, discountType: e.target.value })}
                  label="Discount Type"
                >
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                  <MenuItem value="FREE_ITEM">Free Item</MenuItem>
                  <MenuItem value="SPECIAL_OFFER">Special Offer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount Value"
                type="number"
                value={agreementForm.discountValue}
                onChange={(e) => setAgreementForm({ ...agreementForm, discountValue: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={agreementForm.description}
                onChange={(e) => setAgreementForm({ ...agreementForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Terms"
                multiline
                rows={3}
                value={agreementForm.terms}
                onChange={(e) => setAgreementForm({ ...agreementForm, terms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={agreementForm.startDate}
                onChange={(e) => setAgreementForm({ ...agreementForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={agreementForm.endDate}
                onChange={(e) => setAgreementForm({ ...agreementForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgreementDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAgreement}
            disabled={!agreementForm.partnerId || !agreementForm.discountValue}
          >
            Create Agreement
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;