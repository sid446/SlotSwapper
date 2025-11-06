import dotenv from 'dotenv';
import connectDB from './db/index.ts';
import {app} from './app.ts';

dotenv.config(
    {
        path: "./.env"
    }
);

connectDB().
    then(()=>{
        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    })
    .catch((error)=>{
        console.error(`Error: ${error.message}`);
    })

