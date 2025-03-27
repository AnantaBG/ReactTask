import { Outlet } from "react-router-dom";
import Sidebar from "../components/HomePage/Sidebar";
import NavBar from "../components/HomePage/NavBar";

const HomePage = () => {
    return (
        <section>
            <NavBar></NavBar>
        <div className="flex min-h-[98vh] gap-2">
            <div className="bg-green-200 border border-black border-opacity-35  rounded-xl lg:w-1/5 w-1/3 p-4 flex flex-col justify-between h-[98vh]"><Sidebar></Sidebar></div>
            <div className="bg-green-200 lg:w-4/5  w-2/3 border border-black  border-opacity-35  rounded-xl p-4"><Outlet/></div>        
        </div>
        </section>

    );
};

export default HomePage;