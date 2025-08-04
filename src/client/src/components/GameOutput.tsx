import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography 
} from '@mui/material';

interface GameMessage {
  id: string;
  type: 'command' | 'result' | 'error';
  content: string;
  timestamp: Date;
}

interface GameOutputProps {
  messages: GameMessage[];
}

const GameOutput: React.FC<GameOutputProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageColor = (type: GameMessage['type']) => {
    switch (type) {
      case 'command':
        return 'primary.main';
      case 'error':
        return 'error.main';
      case 'result':
      default:
        return 'text.primary';
    }
  };

  const getMessagePrefix = (type: GameMessage['type']) => {
    switch (type) {
      case 'command':
        return '> ';
      case 'error':
        return '! ';
      case 'result':
      default:
        return '';
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        height: 400, 
        overflow: 'auto',
        backgroundColor: '#fafafa',
        fontFamily: 'monospace'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontFamily: 'inherit' }}>
        Game Output
      </Typography>
      
      {messages.length === 0 ? (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ fontStyle: 'italic', fontFamily: 'inherit' }}
        >
          Welcome to the Text Adventure! Type a command below to begin.
        </Typography>
      ) : (
        messages.map((message) => (
          <Box key={message.id} sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: getMessageColor(message.type),
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {getMessagePrefix(message.type)}{message.content}
            </Typography>
          </Box>
        ))
      )}
      
      <div ref={bottomRef} />
    </Paper>
  );
};

export default GameOutput;