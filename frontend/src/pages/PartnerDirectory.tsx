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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocalOffer as OfferIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { fetchPartners } from '../store/slices/memberSlice';
import { useAuth } from '../hooks/useAuth';

const PartnerDirectory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { partners, isLoading, error } = useSelector((state: RootState) => state.member);

  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPartners());
  }, [dispatch]);

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !businessTypeFilter || partner.businessType === businessTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const businessTypes = [...new Set(partners.map(partner => partner.businessType))];

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

  const handlePartnerClick = (partner: any) => {
    setSelectedPartner(partner);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => dispatch(fetchPartners())}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/member')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Partner Directory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover all available partner businesses and their exclusive offers
          </Typography>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search partners"
              placeholder="Search by name, type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Business Type</InputLabel>
              <Select
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
                label="Business Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {businessTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setBusinessTypeFilter('');
              }}
              startIcon={<FilterIcon />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredPartners.length} of {partners.length} partners
        </Typography>
      </Box>

      {/* Partners Grid */}
      <Grid container spacing={3}>
        {filteredPartners.map((partner) => (
          <Grid item xs={12} sm={6} md={4} key={partner.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handlePartnerClick(partner)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StoreIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {partner.businessName}
                    </Typography>
                    <Chip
                      label={partner.businessType}
                      color={getBusinessTypeColor(partner.businessType)}
                      size="small"
                    />
                  </Box>
                </Box>

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${partner.city}, ${partner.state}`}
                      secondary={partner.address}
                    />
                  </ListItem>
                  
                  {partner.phone && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <PhoneIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={partner.phone} />
                    </ListItem>
                  )}
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <OfferIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${partner.agreements.length} active agreement${partner.agreements.length !== 1 ? 's' : ''}`}
                    />
                  </ListItem>
                </List>

                {partner.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {partner.description}
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePartnerClick(partner);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredPartners.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No partners found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      )}

      {/* Partner Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StoreIcon sx={{ mr: 2 }} />
            {selectedPartner?.businessName}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPartner && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={selectedPartner.businessType}
                  color={getBusinessTypeColor(selectedPartner.businessType)}
                  sx={{ mb: 2 }}
                />
                {selectedPartner.description && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPartner.description}
                  </Typography>
                )}
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {selectedPartner.address}<br />
                    {selectedPartner.city}, {selectedPartner.state} {selectedPartner.zipCode}
                  </Typography>
                </Grid>
                
                {selectedPartner.phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {selectedPartner.phone}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Contact Email
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {selectedPartner.contactEmail}
                  </Typography>
                </Grid>
                
                {selectedPartner.website && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Website
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer">
                        {selectedPartner.website}
                      </a>
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Available Discounts
              </Typography>
              
              {selectedPartner.agreements.length > 0 ? (
                <List>
                  {selectedPartner.agreements.map((agreement: any, index: number) => (
                    <React.Fragment key={agreement.id}>
                      <ListItem>
                        <ListItemIcon>
                          <OfferIcon />
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
                      {index < selectedPartner.agreements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active discount agreements available
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Promotions
              </Typography>
              
              {selectedPartner.promotions.length > 0 ? (
                <List>
                  {selectedPartner.promotions.map((promotion: any, index: number) => (
                    <React.Fragment key={promotion.id}>
                      <ListItem>
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={promotion.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {promotion.description}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {promotion.discountType} - {promotion.discountValue}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Valid: {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < selectedPartner.promotions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active promotions available
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setDetailsDialogOpen(false);
              // Navigate to QR code display or show instructions
              navigate('/member');
            }}
          >
            Show My QR Code
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PartnerDirectory;