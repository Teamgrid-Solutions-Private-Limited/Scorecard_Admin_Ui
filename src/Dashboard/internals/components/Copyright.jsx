import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import digitalAlchemy from '../../../../src/assets/image/digital-alchemy.png';

export default function Copyright(props) {
  return (
    <>
    <Box sx={{display:"flex", padding:"0px 22px 0px 22px", alignItems:"center", justifyContent:"space-around"}}>
    <Typography
      variant="body2"
      align="center"
      {...props}
      sx={[
        {
          color: 'text.secondary',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      {'© '}
      {new Date().getFullYear()}
      {'. Susan B. Anthony Pro-life America.'}
      
     
      
    </Typography>
    
    <Box component="span" sx={{ display: 'flex', gap:1 }}>
    <Typography sx={{color:'text.secondary'}}>Developed by</Typography>
    <img src={digitalAlchemy} alt="Digital Alchemy" style={{ height: '20px' }} />
    </Box>
    </Box>
    
    </>
  );
}
