import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

export default function UserSelector() {
  const { user, setUser, USERS } = useUser();

  const handleChange = (e) => {
    const selected = USERS.find(u => u.username === e.target.value);
    setUser(selected);
  };

  return (
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Typography variant="body2">Current user:</Typography>
      <FormControl size="small">
        <InputLabel id="user-select-label">User</InputLabel>
        <Select
          labelId="user-select-label"
          value={user.username}
          label="User"
          onChange={handleChange}
        >
          {USERS.map(u => (
            <MenuItem key={u.username} value={u.username}>
              {u.username} ({u.role})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 