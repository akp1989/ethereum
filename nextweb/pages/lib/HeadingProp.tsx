import { Grid } from "@mui/material";
import React from 'react';

export const dateForDisplay = new Date().toLocaleString("en-US", { month: "long" }) +' '+ new Date().toLocaleString("en-US", { day : '2-digit'})+ ' '+new Date().getFullYear();

export const HeadingProp = () => {
return(
    <Grid container width={1200} spacing={2} direction='row' justifyContent='space-between' alignItems="baseline" style={{background: '#FFFFFF'}} marginTop={5} marginBottom={5}>
        <Grid item xs={1} ></Grid>
        <Grid item xs={9} >
            <h2>Genera Demo</h2>
        </Grid>
        <Grid item xs={2} alignItems="baseline">
            <div>{dateForDisplay} </div>
        </Grid>
    </Grid> 
)
}