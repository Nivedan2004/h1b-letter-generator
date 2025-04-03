'use client';
import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function LetterForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    beneficiary: {
      full_name: '',
      nationality: '',
    },
    employer: {
      company_name: '',
      job_title: '',
      pay_rate: '',
      job_roles: [''],
      company_website: '',
    },
  });

  const handleInputChange = (section, field, value, index = null) => {
    if (field === 'job_roles' && index !== null) {
      const newJobRoles = [...formData.employer.job_roles];
      newJobRoles[index] = value;
      setFormData({
        ...formData,
        employer: {
          ...formData.employer,
          job_roles: newJobRoles,
        },
      });
    } else {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value,
        },
      });
    }
  };

  const addJobRole = () => {
    setFormData({
      ...formData,
      employer: {
        ...formData.employer,
        job_roles: [...formData.employer.job_roles, ''],
      },
    });
  };

  const removeJobRole = (index) => {
    const newJobRoles = formData.employer.job_roles.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      employer: {
        ...formData.employer,
        job_roles: newJobRoles,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Beneficiary Information
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Full Name"
          value={formData.beneficiary.full_name}
          onChange={(e) => handleInputChange('beneficiary', 'full_name', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Nationality"
          value={formData.beneficiary.nationality}
          onChange={(e) => handleInputChange('beneficiary', 'nationality', e.target.value)}
          margin="normal"
          required
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        Employer Information
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Company Name"
          value={formData.employer.company_name}
          onChange={(e) => handleInputChange('employer', 'company_name', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Job Title"
          value={formData.employer.job_title}
          onChange={(e) => handleInputChange('employer', 'job_title', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Pay Rate"
          value={formData.employer.pay_rate}
          onChange={(e) => handleInputChange('employer', 'pay_rate', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Company Website"
          value={formData.employer.company_website}
          onChange={(e) => handleInputChange('employer', 'company_website', e.target.value)}
          margin="normal"
          required
          type="url"
        />

        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Job Roles
        </Typography>
        {formData.employer.job_roles.map((role, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              label={`Role ${index + 1}`}
              value={role}
              onChange={(e) => handleInputChange('employer', 'job_roles', e.target.value, index)}
              margin="normal"
              required
            />
            {formData.employer.job_roles.length > 1 && (
              <IconButton
                onClick={() => removeJobRole(index)}
                color="error"
                sx={{ mt: 2 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}
        <Button variant="outlined" onClick={addJobRole} sx={{ mt: 1 }}>
          Add Job Role
        </Button>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Letter'}
      </Button>
    </form>
  );
}