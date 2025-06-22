import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Chip,
  Paper 
} from '@mui/material';
import { Person } from '@mui/icons-material';

export default function UserSelector() {
  const { user, setUser, USERS } = useUser();
  const { darkMode } = useTheme();

  const handleChange = (e) => {
    const selected = USERS.find(u => u.username === e.target.value);
    setUser(selected);
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'error' : 'primary';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 16,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <Person sx={{ color: 'primary.main' }} />
          <Typography variant="body2" fontWeight={600}>
            Current User:
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="user-select-label">Select User</InputLabel>
          <Select
            labelId="user-select-label"
            value={user.username}
            label="Select User"
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            {USERS.map(u => (
              <MenuItem key={u.username} value={u.username}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight={500}>
                    {u.username}
                  </Typography>
                  <Chip
                    label={u.role}
                    size="small"
                    color={getRoleColor(u.role)}
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip
          icon={<Person />}
          label={`${user.username} (${user.role})`}
          color={getRoleColor(user.role)}
          variant="filled"
          sx={{
            fontWeight: 600,
            background: darkMode 
              ? `linear-gradient(135deg, ${user.role === 'admin' ? '#ff6b6b' : '#74b9ff'} 0%, ${user.role === 'admin' ? '#d63031' : '#0984e3'} 100%)`
              : `linear-gradient(135deg, ${user.role === 'admin' ? '#e74c3c' : '#3498db'} 0%, ${user.role === 'admin' ? '#c0392b' : '#2d3436'} 100%)`,
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}
        />
      </Box>
    </Paper>
  );
} 