import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';

interface CommandInputProps {
  sessionId: string;
  onCommandResult: (result: any) => void;
  disabled?: boolean;
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

const CommandInput: React.FC<CommandInputProps> = ({ 
  sessionId, 
  onCommandResult, 
  disabled = false 
}) => {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/game/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          command: command.trim()
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onCommandResult(data);
        setCommand(''); // Clear input after successful command
      } else {
        onCommandResult({
          success: false,
          result: {
            success: false,
            message: data.error || 'Command failed'
          }
        });
      }
    } catch (error) {
      console.error('Command submission error:', error);
      onCommandResult({
        success: false,
        result: {
          success: false,
          message: 'Failed to send command. Please try again.'
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Command Input
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a command (e.g., 'go north', 'take key', 'look')"
          disabled={disabled || isProcessing}
          variant="outlined"
          size="small"
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={disabled || isProcessing || !command.trim()}
          sx={{ minWidth: 100 }}
        >
          {isProcessing ? <CircularProgress size={20} /> : 'Send'}
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Press Enter to send your command
      </Typography>
    </Paper>
  );
};

export default CommandInput;