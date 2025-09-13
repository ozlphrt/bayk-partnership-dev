import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  LocalOffer as DiscountIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchPartners } from '../store/slices/memberSlice';

const PartnerDirectory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { partners, isLoading, error } = useSelector(
    (state: RootState) => state.member
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    dispatch(fetchPartners());
  }, [dispatch]);

  const businessTypes = [
    'ALL',
    'HOTEL',
    'RESTAURANT',
    'GYM',
    'SAILING_EQUIPMENT',
    'MARINA',
    'TRAVEL',
    'INSURANCE',
    'OTHER',
  ];

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'ALL' || partner.businessType === selectedType;
    
    return matchesSearch && matchesType && partner.isActive && partner.isVerified;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Partner Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover exclusive discounts from our partner businesses
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search partners by name, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {businessTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                    clickable
                    color={selectedType === type ? 'primary' : 'default'}
                    onClick={() => setSelectedType(type)}
                    variant={selectedType === type ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} found
        </Typography>
      </Box>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No partners found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or check back later for new partners.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredPartners.map((partner) => (
            <Grid item xs={12} sm={6} md={4} key={partner.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Business Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {partner.businessName}
                    </Typography>
                    <Chip
                      label={partner.businessType.replace('_', ' ')}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Description */}
                  {partner.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {partner.description}
                    </Typography>
                  )}

                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {partner.city}, {partner.state}
                    </Typography>
                  </Box>

                  {/* Contact Info */}
                  <Box sx={{ mb: 2 }}>
                    {partner.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {partner.phone}
                        </Typography>
                      </Box>
                    )}
                    {partner.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WebsiteIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography
                          variant="body2"
                          component="a"
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Visit Website
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Discounts */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Available Discounts:
                    </Typography>
                    {partner.agreements.length > 0 ? (
                      <Box>
                        {partner.agreements.slice(0, 2).map((agreement) => (
                          <Chip
                            key={agreement.id}
                            label={`${agreement.discountValue}${agreement.discountType === 'PERCENTAGE' ? '%' : '$'} off`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                        {partner.agreements.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{partner.agreements.length - 2} more
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No active discounts
                      </Typography>
                    )}
                  </Box>

                  {/* Promotions */}
                  {partner.promotions.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Current Promotions:
                      </Typography>
                      {partner.promotions.slice(0, 1).map((promotion) => (
                        <Chip
                          key={promotion.id}
                          label={promotion.title}
                          size="small"
                          color="warning"
                          variant="outlined"
                          icon={<DiscountIcon />}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>

                {/* Action Button */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PartnerDirectory;
