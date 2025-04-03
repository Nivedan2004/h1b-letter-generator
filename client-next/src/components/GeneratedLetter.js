'use client';
import { Box, Paper, Typography, IconButton, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

export default function GeneratedLetter({ letter, pdfData, onCopy }) {
  const handleDownload = () => {
    // Convert base64 to blob
    const byteCharacters = atob(pdfData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'h1b-support-letter.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Generated Letter</Typography>
        <Box>
          <IconButton onClick={onCopy} color="primary" title="Copy to clipboard">
            <ContentCopyIcon />
          </IconButton>
          <IconButton onClick={handleDownload} color="primary" title="Download PDF">
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: 1,
        }}
      >
        {letter}
      </Typography>
    </Paper>
  );
}