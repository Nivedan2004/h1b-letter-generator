'use client';
import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  CircularProgress, 
  Box 
} from '@mui/material';
import LetterForm from '@/components/LetterForm';
import GeneratedLetter from '@/components/GeneratedLetter';
import CustomSnackbar from '@/components/CustomSnackbar';
import { generateLetter } from '@/utils/api';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [pdfData, setPdfData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // Clear previous letter if any
      setGeneratedLetter('');
      setPdfData(null);

      const response = await generateLetter(formData);
      
      if (!response.data || (!response.data.letter && !response.data.pdf)) {
        throw new Error('Invalid response format from server');
      }

      setGeneratedLetter(response.data.letter);
      setPdfData(response.data.pdf);
      
      setSnackbar({
        open: true,
        message: 'Support letter generated successfully!',
        severity: 'success',
      });

    } catch (error) {
      console.error('Letter generation error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to generate letter';
      
      if (error.response) {
        // Server responded with an error
        if (error.response.status === 429) {
          errorMessage = 'Rate limit reached. Please try again in a few moments.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication error. Please check API configuration.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message.includes('template not found')) {
        errorMessage = 'Example template file not found. Please contact support.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLetter = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setSnackbar({
        open: true,
        message: 'Letter copied to clipboard!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy letter to clipboard',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ mb: 4 }}
      >
        H-1B Support Letter Generator
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: 'background.paper' 
        }}
      >
        <LetterForm onSubmit={handleSubmit} loading={loading} />
      </Paper>

      {loading && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            my: 4 
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {generatedLetter && !loading && (
        <GeneratedLetter 
          letter={generatedLetter} 
          pdfData={pdfData}
          onCopy={handleCopyLetter} 
        />
      )}

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        autoHideDuration={6000}
      />

      {/* Footer */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
        sx={{ mt: 4 }}
      >
        This tool generates H-1B support letters based on provided templates and information.
        Please review all generated content for accuracy before use.
      </Typography>
    </Container>
  );
}