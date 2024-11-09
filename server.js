import cors from "cors";
import express from "express";
//import dotenv from 'dotenv';
import router from "./Backend/routes/index";
//import blogRoutes from './Backend/routes/blogRoutes';

//dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(router);
//app.use(blogRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
